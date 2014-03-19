from django.http import HttpResponse
from django.shortcuts import render, redirect

from django.core import serializers

from django.views.decorators.csrf import csrf_exempt

from django.contrib import messages
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.contrib.auth import login, logout

from chat.models import Message, BetaKey, BugReport
from chat.forms import *

from django_socketio.events import on_message

from django.template.defaultfilters import register
from urllib import unquote

from django.forms.util import ErrorList


@register.filter
def unquote_new(value):
    return unquote(value)

context = dict()
context['registerForm'] = RegisterForm()
comptoir_created = False

@on_message
def my_message_handler(request, socket, context, message):
    print message

def index(request):
    """
	Home view

    """

    global comptoir_created

    template_name = "chat/index.html"
   
    comptoirs = Comptoir.objects.all()

    my_comptoirs = list()

    user = request.user
    if not user.is_authenticated or user.username == "AnonymousUser":
        user_id = 0
    else:
        user_id = user.id
    

    for cmpt in comptoirs:
        msg = Message.objects.all().filter(comptoir=cmpt.id, owner=user_id)
        if len(msg) > 0 or cmpt.owner == user:
            my_comptoirs.append(cmpt)

    context["comptoirs"] = my_comptoirs

    context["comptoir_form"] = ComptoirForm(request.POST) if "csrfmiddlewaretoken" in request.POST.keys() and not comptoir_created else ComptoirForm()

    comptoir_created = False

    return render(request, template_name, context)


@csrf_exempt
def send(request):
    """
	View used to send messages to a chat synchronously
	Redirect to home view after posting

    """    
    
    # The user must be authenticated to be able to send messages
    if not request.user.is_authenticated or str(request.user) == "AnonymousUser":
        return HttpResponse("Error")

    # He also needs to have access to the comptoir
    if not request.session[request.POST['cid']]:
        return HttpResponse("Error")

    if request.method != "POST":
    	return redirect("home")

    Message(content=request.POST['msg'], comptoir=Comptoir.objects.get(id=request.POST['cid']), owner=request.user).save()
    
    return HttpResponse("OK")


@csrf_exempt
def update(request):
    """
	Update the chat box by requesting the new messages

    """

    comptoir = Comptoir.objects.get(id=request.POST["cid"])

    index = request.POST['index']
    return HttpResponse(serializers.serialize("json", Message.objects.all().filter(comptoir=comptoir, id__gt=int(index)), fields=("owner", "date", "content")))



# ================================= USER MANAGEMENT RELATED VIEWS ================================= #

def auth(request):
    """
	Authentication view
	
    """

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

    template_name = "chat/register.html"

    form = RegisterForm(request.POST or None)


    if form.is_valid():

        ### TO REMOVE AFTER BETA ###
        if "beta_key" not in request.POST.keys():
            context['form'] = form
            return redirect("home")

        key = request.POST['beta_key']
        if key == "":
            messages.warning(request, "No key specified.")
            context['form'] = form
            return redirect("home")

        try:
            av_key = BetaKey.objects.get(key=key)
        except Exception:
            messages.error(request, "This key does not exists. You can ask a beta key at fdg@udtq.fr.")
            context['form'] = form
            return redirect("home")

        if av_key != None and not av_key.used:
            av_key.used = True
            av_key.save()
        else:
            messages.info(request, "This key has already been used. You can ask for a new one at fdg@udtq.fr.")
            context['form'] = form
            return redirect("home")

        #############################

        new_user = form.save()
        user = authenticate(username=request.POST['username'], password=request.POST['password1'])
        login(request, user)
        messages.success(request, "Your registration is done. Welcome. Please do not hesitate to report any bug or suggestion through 'Report a bug'.")
        # return redirect(request.session['history'][-1])
    # request.session['redirect'])
    else:
        messages.warning(request, "Registration failed.")
        context['form'] = form
    
    return redirect("home")


def sign_out(request):
    """
	Logout the user and redirect to the home page

    """

    logout(request)

    return redirect("home")


def create_comptoir(request):

    global comptoir_created

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
                              public=data['public'],
                              key_hash=data['key_hash'])

        new_comptoir.save()

        messages.success(request, "The comptoir has been created successfully. You can access it by clicking on your nickname.")

        # Global variable set to True to distinguish between form with error
        # (that will be filled by index) and form treated that as to be cleaned up
        comptoir_created = True

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

    template_name = "chat/see_comptoir.html"

    comptoir = Comptoir.objects.get(id=cid)
        
    if comptoir is None:
        return redirect("home")

    if cid not in request.session.keys():
        request.session[cid] = False
    
    if comptoir.public:
        request.session[cid] = True
    
    if request.method == "POST":
        if request.POST['type'] == "password":
            if request.POST['password'] == comptoir.password:
                request.session[cid] = True
                return redirect("join_comptoir", cid)

    context["title"] = comptoir.title
    context["description"] = comptoir.description
    context["id"] = comptoir.id
    context['public'] = comptoir.public
    context["request"] = request

    context["msgs"] = Message.objects.all().filter(comptoir=cid).order_by('date')
    if len(context["msgs"]) > 0:
        context["senti"] = context["msgs"][len(context["msgs"])-1].id
    else:
        context["senti"] = 0

    return render(request, template_name, context)


def report(request):
    template_name = "chat/report.html"

    if request.method == "POST":
        if "description" not in request.POST.keys() or request.POST['description'] == "":
            messages.error(request, "Sumbission failed: you must enter a description.")
        else:
            report = BugReport(description=request.POST['description'])
            if 'url' in request.POST.keys():
                report.url = request.POST['url']
            report.reporter = None if request.user.is_authenticated or request.user.username == "AnonymousUser" else request.user
            report.save()
            messages.info(request, "Your report has been sent. Thank you.")
            return redirect("home")

    context['reportForm'] = BugReportForm()

    return render(request, template_name, context)


def about(request):
    template_name = "chat/about.html"

    return render(request, template_name, context)


def reporting_box(request):

    template_name = "chat/reporting_box.html"
    
    user = request.user
    if not user.is_authenticated or user.username != "_Frky":
        return redirect("home")

    context['bugs'] = BugReport.objects.all() 

    return render(request, template_name, context)

