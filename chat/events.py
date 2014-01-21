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
    
    if (comptoir.key_hash != message["hash"]):
        print comptoir.key_hash
        print message["hash"]
        socket.send({"type": "error", "error_msg": "Your message was rejected because your key is not valid."})

    else:
        msg = Message(owner=user, comptoir=comptoir, content=message["content"])
        msg.save()
        comptoir.last_message = msg
        comptoir.save()

        socket.send_and_broadcast_channel({"type": "new-message", "user": user.username, "content": message["content"], "msgdate": "yolo"}, channel=message["cid"])

