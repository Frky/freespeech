from django.http import HttpResponse
from django.shortcuts import render, redirect, get_object_or_404

from django.template import RequestContext
from django.core import serializers
from django.utils import simplejson
from django.core.exceptions import ObjectDoesNotExist
from django.core.mail import send_mail

from django.views.decorators.csrf import csrf_exempt

from django.contrib import messages
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.contrib.auth import login, logout

from chat.models import IndependantMessage, Message, BetaKey, BugReport, ChatUser, LastVisit
from chat.forms import *

from django_socketio.events import on_message

from django.template.defaultfilters import register
from urllib import unquote

from django.forms.util import ErrorList

from freespeech.settings import CONTACT_EMAIL 

import datetime, pytz
from freespeech.settings import TIME_ZONE
from django.utils.timezone import utc

from chat.utils import date_to_tooltip

from chat.chat_management import Chat

import json

VERSION = "0.94"

timezone_local = pytz.timezone(TIME_ZONE)

@register.filter
def unquote_new(value):
    return unquote(value)


comptoir_created = False


def index(request):
    context = RequestContext(request)
    context['registerForm'] = RegisterForm()
    context['version'] = VERSION
    """
	Home view

    """

    global comptoir_created

    template_name = "chat/index.html"

    context["title"] = ""
    context["description"] = ""
    context["comptoir_form"] = ComptoirForm(request.POST) if "csrfmiddlewaretoken" in request.POST.keys() and not comptoir_created else ComptoirForm()

    comptoir_created = False

    return render(request, template_name, context)


# ================================= USER MANAGEMENT RELATED VIEWS ================================= #

def auth(request):
    """
	Authentication view
	
    """

    context = RequestContext(request)
    context['registerForm'] = RegisterForm()
    context['version'] = VERSION
    template_name = "chat/login.html"

    if request.method == 'POST':

        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(username=username, password=password)

        if user is not None:
            if user.is_active:
                login(request, user)
                context['auth'] = True
            else:
                messages.error(request, "Authentication failed.")
                context['auth'] = False
        else:
            messages.error(request, "Authentication failed.")
            context['auth'] = False
        context['username'] = username

        return redirect("home")
    else:
        return render(request, template_name, context)


def register(request):
    """
	Register view
	Used to send the form to the client and also to handle the form submission

    """

    context = RequestContext(request)
    context['registerForm'] = RegisterForm()
    context['version'] = VERSION
    template_name = "chat/register.html"

    form = RegisterForm(request.POST or None)


    if form.is_valid():

        if len(request.POST['username']) > 20:
            messages.warning(request, "Username must be of 20 chars max.")
            context['form'] = form
            return redirect("home")

        ### TO REMOVE AFTER BETA ###
        if "beta_key" not in request.POST.keys():
            context['form'] = form
            return redirect("home")

        key = request.POST['beta_key']
        if key == "":
            messages.warning(request, "No key specified. You can ask for a beta key at " + CONTACT_EMAIL + ".")
            context['form'] = form
            return redirect("home")

        try:
            av_key = BetaKey.objects.get(key=key)
        except Exception:
            messages.error(request, "This key does not exists. You can ask a beta key at " + CONTACT_EMAIL + ".")
            context['form'] = form
            return redirect("home")

        if av_key != None and not av_key.used:
            av_key.used = True
            av_key.save()
        else:
            messages.info(request, "This key has already been used. You can ask for a new one at " + CONTACT_EMAIL + ".")
            context['form'] = form
            return redirect("home")

        #############################

        new_user = form.save()
        user = authenticate(username=request.POST['username'], password=request.POST['password1'])
        ChatUser(user=new_user).save()
        login(request, user)
        messages.success(request, "Your registration is done. Welcome. Please do not hesitate to report any bug or suggestion through 'Report a bug'.")
        # return redirect(request.session['history'][-1])
    # request.session['redirect'])
    else:
        if request.POST['password1'] != request.POST['password2']:
            messages.warning(request, "The two passwords mismatch.")
            context['form'] = form
        else:
            messages.warning(request, "Registration failed for unknown reason.")
            context['form'] = form
    
    return redirect("home")


def sign_out(request):
    """
	Logout the user and redirect to the home page

    """

    context = RequestContext(request)
    context['registerForm'] = RegisterForm()
    context['version'] = VERSION
    logout(request)

    return redirect("home")


def create_comptoir(request):

    global comptoir_created

    context = RequestContext(request)
    context['registerForm'] = RegisterForm()
    context['version'] = VERSION
    form = ComptoirForm(request.POST or None)

    if form.is_valid():
        data = form.cleaned_data

        if request.user.is_authenticated and str(request.user) != "AnonymousUser":
            user = request.user 
        else:
            user = None

        if not data['public'] and (data['key_hash'] is None or data['key_hash'] == ""):
            form._errors['key_hash'] = ErrorList("This field is requested to create a private comptoir.")
            messages.warning(request, "Comptoir not created: no hash given.")
            return index(request)

        new_comptoir = Comptoir(owner=user,
                              title=data['title'],
                              description=data['description'],
                              public= not data['public'],
                              key_hash=data['key_hash'],
                              title_is_ciphered= True)

        new_comptoir.save()

        lv = LastVisit(comptoir=new_comptoir)
        lv.save()
        request.user.chatuser.last_visits.add(lv)
        request.user.comptoirs.append((new_comptoir, 0))

        messages.success(request, "The comptoir has been created successfully. You can access your comptoirs by clicking on your nickname.")

        # Global variable set to True to distinguish between form with error
        # (that will be filled by index) and form treated that as to be cleaned up
        comptoir_created = True
        
        return redirect("join_comptoir", new_comptoir.id);

    else:
        messages.warning(request, "Comptoir not created: some errors in the form.")
    
        return index(request);


def check_hash(request):

    if not ('cid' in request.GET.keys()) or not ('hash' in request.GET.keys()):
        return HttpResponse(False)
    else:
        comptoir = Comptoir.objects.get(id=request.GET['cid'])

        return HttpResponse(comptoir.key_hash == request.GET['hash'])



def join_comptoir(request, cid):

    context = RequestContext(request)
    context['registerForm'] = RegisterForm()
    context['version'] = VERSION
    template_name = "chat/see_comptoir.html"

    comptoir = get_object_or_404(Comptoir, id=cid)
        
    if comptoir is None:
        return redirect("home")

    if cid not in request.session.keys():
        request.session[cid] = False
    
    if comptoir.public:
        request.session[cid] = True
    
    context["title"] = comptoir.title
    context["description"] = comptoir.description
    context["id"] = comptoir.id
    context['public'] = comptoir.public
    context["request"] = request
    context["title_is_ciphered"] = comptoir.title_is_ciphered

    count = Message.objects.filter(comptoir=comptoir).count()
    msgs = Message.objects.filter(comptoir=comptoir).order_by('date')[max(0, count - 150):]
    context["msgs"] = msgs 

    if len(context["msgs"]) > 0:
        context["senti"] = context["msgs"][len(context["msgs"])-1].id
    else:
        context["senti"] = 0
    
    user = request.user
    if not user.is_anonymous() and user.is_authenticated():
        try:
            lv = user.chatuser.last_visits.get(comptoir=comptoir)
            lv.date = datetime.datetime.utcnow().replace(tzinfo=utc)
            lv.save()
        except ObjectDoesNotExist:
            lv = LastVisit()
            lv.comptoir = comptoir
            lv.save()
            user.chatuser.last_visits.add(lv)
            messages.info(request, "Hello, stranger.")
            
    for c in request.user.comptoirs:
        if c[0] == comptoir:
            new_c = (c[0], 0)
            request.user.comptoirs.remove(c)
            request.user.comptoirs.append(new_c)
            break

    return render(request, template_name, context)


def report(request):
    template_name = "chat/report.html"
    context = RequestContext(request)
    context['registerForm'] = RegisterForm()
    context['version'] = VERSION

    if request.method == "POST":
        if "description" not in request.POST.keys() or request.POST['description'] == "":
            messages.error(request, "Sumbission failed: you must enter a description.")
        else:
            report = BugReport(description=request.POST['description'])
            if 'url' in request.POST.keys():
                report.url = request.POST['url']
            report.reporter = None if (not request.user.is_authenticated() or request.user.is_anonymous()) else request.user
            report.save()
            messages.info(request, "Your report has been sent. Thank you.")
            return redirect("home")

    context['reportForm'] = BugReportForm()

    return render(request, template_name, context)


def about(request):
    template_name = "chat/about.html"
    context = RequestContext(request)
    context['registerForm'] = RegisterForm()
    context['version'] = VERSION

    return render(request, template_name, context)


def reporting_box(request):

    context = RequestContext(request)
    context['registerForm'] = RegisterForm()
    context['version'] = VERSION
    template_name = "chat/reporting_box.html"
    
    user = request.user
    if not user.is_authenticated() or user.username != "_Frky":
        return redirect("home")

    context['bugs'] = BugReport.objects.all() 

    return render(request, template_name, context)


def load_previous_messages(request):
    
    if "cid" not in request.GET.keys() or "senti" not in request.GET.keys():
        return HttpResponse()

    cid = request.GET["cid"]
    senti = request.GET["senti"]

    count = Message.objects.filter(comptoir=cid, id__lt=senti).count()
    msgs = Message.objects.filter(comptoir=cid, id__lt=senti).order_by('date')[max(0, count - 150):]

    json_data = "{\"senti\": " + str(max(0, count - 50)) + ", \"previous_msgs\": ["
    for i,msg in enumerate(msgs): #Message.objects.all().filter(comptoir=cid, id__lt=17)):
        if i != 0:
            json_data += ","
        json_data += "{\"fields\":{"
        json_data += "\"owner\": \"" + msg.owner.username + "\", "
        json_data += "\"content\": \"" + msg.content.replace("\n", "") + "\", "
        json_data += "\"date\": \"" + date_to_tooltip(msg.date.astimezone(timezone_local)) + "\""
        json_data += "}}"
    json_data += "]}"

    return HttpResponse(json_data, mimetype='application/json')
    # m = IndependantMessage.objects.all().filter(id__lt=7).select_related('Message')
#    m = Message.objects.all().filter(id__lt=7).select_related('IndependantMessage')
    mid = [msg.id for msg in Message.objects.all().filter(comptoir=cid)[:7]]
    m = [IndependantMessage.objects.get(id=m_id) for m_id in mid] 
    m_json = serializers.serialize("json", m)
    m_list = simplejson.loads(m_json)
    json_data = simplejson.dumps({'previous_msgs': m_list})


def remove_msg(request):
    try:
        cid = request.GET["cid"]
        mid = request.GET["mid"]
        chash = request.GET["chash"]
    except Exception:
        print "Key Error"
        return HttpResponse("KO")
    try:
        msg = Message.objects.get(id=mid)
        cmptr = Comptoir.objects.get(id=cid)
    except Exception:
        print "Value Error"
        return HttpResponse("KO")

    if msg.owner != request.user or chash != cmptr.key_hash:
        print "Hash error"
        return HttpResponse("KO")

    msg.content = ""
    msg.save()
    return HttpResponse("OK")

def ajax_comptoir(request, cid):
    template_name = "chat/includes/cmptr.html"

    context = RequestContext(request)
    context['registerForm'] = RegisterForm()
    context['version'] = VERSION
    comptoir = get_object_or_404(Comptoir, id=cid)
        
    if comptoir is None:
        return redirect("home")

    if cid not in request.session.keys():
        request.session[cid] = False
    
    if comptoir.public:
        request.session[cid] = True
    
    context["title"] = comptoir.title
    context["description"] = comptoir.description
    context["id"] = comptoir.id
    context['public'] = comptoir.public
    context["request"] = request
    context["title_is_ciphered"] = comptoir.title_is_ciphered

    count = Message.objects.filter(comptoir=comptoir).count()
    msgs = Message.objects.filter(comptoir=comptoir).order_by('date')[max(0, count - 150):]
    context["msgs"] = msgs 

    if len(context["msgs"]) > 0:
        context["senti"] = context["msgs"][len(context["msgs"])-1].id
    else:
        context["senti"] = 0
    
    user = request.user
    if not user.is_anonymous() and user.is_authenticated():
        try:
            lv = user.chatuser.last_visits.get(comptoir=comptoir)
            lv.date = datetime.datetime.utcnow().replace(tzinfo=utc)
            lv.save()
        except ObjectDoesNotExist:
            lv = LastVisit()
            lv.comptoir = comptoir
            lv.save()
            user.chatuser.last_visits.add(lv)
            messages.info(request, "Hello, stranger.")
            
    for c in request.user.comptoirs:
        if c[0] == comptoir:
            new_c = (c[0], 0)
            request.user.comptoirs.remove(c)
            request.user.comptoirs.append(new_c)
            break

    return render(request, template_name, context)


def under_work(request):
    return render(request, "chat/under_work.html")


def cmptr_info(request, cid):
    comptoir = get_object_or_404(Comptoir, id=cid)
    json_data = "{\"title\": \"" + comptoir.title + "\", \"description\": \"" + comptoir.description + "\"}"
    return HttpResponse(json_data, mimetype='application/json')





## TESTING VIEWS FOR 404 & 500 PAGES ##
def error404(request):
    return render(request, '404.html')

def error505(request):
    return render(request, '505.html')

def welcome(request):

    if "email" in request.POST: 
        requester = request.POST["email"]
    
        if requester == "":
            return render(request, "chat/welcome.html", {"error": "email address not provided"})
        else:

            # Checking if already asked for a key 
            with open("chat/beta_requests.log", "r") as log:
                content = log.read()
            if content.find(requester) > -1:
                return render(request, "chat/welcome.html", {"error": "You already asked for a key !"})

            with open("chat/beta_requests.log", "a") as log:
                log.write("[{0}] {1}\n".format(datetime.datetime.now(), request))
            send_mail('[BETA KEY REQUEST]', requester + " has asked for a beta key from fsp/welcome", 'fsp@udtq.fr',
                    ['fsp@udtq.fr'], fail_silently=False)
            return render(request, "chat/welcome.html", {"request_sent": True})
    else:
        return render(request, "chat/welcome.html")





## WEBSOCKET RELTIVE VIEWS


#@csrf_exempt
#def ws_connect(request):
#    """
#        This function is used to maintain a consistent list
#        of connected users. Each user has to connect its socket to 
#        be able to receive messages.
#
#    """


@csrf_exempt
def ws_identicate(request):
    Chat.connect(request.user)
    return HttpResponse("ok")
    

@csrf_exempt
def ws_msg(request):
    try:
        msg = request.POST["msg"]
        cid = request.POST["cid"]
        chash = request.POST["hash"]
    except KeyError:
        return HttpResponse("err")
    Chat.message(request.user, cid, chash, msg)
    return HttpResponse("ack")


@csrf_exempt
def ws_wizz(request):
    try:
        msg = request.POST["msg"]
        cid = request.POST["cid"]
        chash = request.POST["hash"]
    except KeyError:
        return HttpResponse("err")
    print "Wizz received"
    Chat.wizz(request.user, cid, chash, msg)
    return HttpResponse("ack")
