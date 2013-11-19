from django.http import HttpResponse
from django.shortcuts import render, redirect

from django.core import serializers

from django.views.decorators.csrf import csrf_exempt

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.contrib.auth import login, logout

from chat.models import Message
from chat.forms import *


context = dict()


def index(request):
    """
	Home view

    """

    template_name = "chat/index.html"
   
    comptoirs = Comptoir.objects.all()

    my_comptoirs = list()

    for cmpt in comptoirs:
        msg = Message.objects.all().filter(comptoir=cmpt.id)
        if len(msg) > 0:
            print msg
            my_comptoirs.append(cmpt)

    context["comptoirs"] = my_comptoirs

    context["comptoir_form"] = ComptoirForm()

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
                context['auth'] = False
        else:
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

    form = UserCreationForm(request.POST or None)

    if form.is_valid():
        new_user = form.save()
        user = authenticate(username=request.POST['username'], password=request.POST['password1'])
        login(request, user)
        # return redirect(request.session['history'][-1])
        return redirect("home")
    # request.session['redirect'])
    else:
        context['form'] = form
        return render(request, template_name, context)


def sign_out(request):
    """
	Logout the user and redirect to the home page

    """

    logout(request)

    return redirect("home")


def create_comptoir(request):

    form = ComptoirForm(request.POST or None)

    if form.is_valid():
        data = form.cleaned_data
        new_comptoir = Comptoir(title=data['title'],
                              description=data['description'],
                              public=data['public'],
                              password=data['password'])
        new_comptoir.save()
        
    return redirect("home")


def join_comptoir(request, cid):

    template_name = "chat/see_comptoir.html"

    comptoir = Comptoir.objects.get(id=cid)
        
    if comptoir == None:
        return redirect("home")

    if cid not in request.session.keys():
        request.session[cid] = False
    
    if comptoir.public:
        request.session[cid] = True
    
    context["can_view"] = request.session[cid]

    if request.method == "POST":
        if request.POST['type'] == "password":
            if request.POST['password'] == comptoir.password:
                request.session[cid] = True
                return redirect("join_comptoir", cid)

    context["title"] = comptoir.title
    context["description"] = comptoir.description
    context["id"] = comptoir.id

    context["messages"] = Message.objects.all().filter(comptoir=cid).order_by('date')
    if len(context["messages"]) > 0:
        context["senti"] = context["messages"][len(context["messages"]) - 1].id
    else:
        context["senti"] = 0

    return render(request, template_name, context)
