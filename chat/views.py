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
    
    context["messages"] = Message.objects.all().order_by('date')
    context["senti"] = context["messages"][len(context["messages"]) - 1].id

    context["comptoir_form"] = ComptoirForm()

    return render(request, template_name, context)


def send(request):
    """
	View used to send messages to a chat synchronously
	Redirect to home view after posting

    """    

    if request.method != "POST":
    	return redirect("home")

    Message(content=request.POST['msg']).save()
    
    return redirect("home")


@csrf_exempt
def update(request):
    """
	Update the chat box by requesting the new messages

    """

    index = request.POST['index']
    return HttpResponse(serializers.serialize("json", Message.objects.all().filter(id__gt=int(index))))



# ================================= USER MANAGEMENT RELATED VIEWS ================================= #

def auth(request):
    """
	Authentication view
	
    """

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
        return HttpResponse(status=404)


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
