#-*- coding: utf-8 -*-

from django.contrib.sessions.models import Session
from django.contrib.auth.models import User
from django_socketio import events

from chat.models import Message, Comptoir

@events.on_message(channel="^")
def message(request, socket, context, message):
    comptoir = Comptoir.objects.get(id=message["cid"])
    session = Session.objects.get(session_key=message['session_key'])
    uid = session.get_decoded().get('_auth_user_id')
    user = User.objects.get(pk=uid)
    
    msg = Message(owner=user, comptoir=comptoir, content=message["content"])
    msg.save()
    comptoir.last_message = msg
    comptoir.save()

    socket.send_and_broadcast_channel({"type": "new-message", "user": user.username, "content": message["content"], "msgdate": msg.date.strftime("%I:%M %p")}, channel=message["cid"])
#    b. %d, %Y, %i:%M %p

