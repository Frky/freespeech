#-*- coding: utf-8 -*-

from django.contrib.sessions.models import Session
from django.contrib.auth.models import User
from django_socketio import events

from chat.models import Message, Comptoir

import pytz

from freespeech.settings import TIME_ZONE


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

        # At this point the date of the message is in utc format, so we need to correct it 
        timezone_local = pytz.timezone(TIME_ZONE)
        msg_local_date = msg.date.astimezone(timezone_local)

        socket.send_and_broadcast_channel({"type": "new-message", "user": user.username, "content": message["content"], "msgdate": msg_local_date.strftime("%b. %e, %Y, %l:%M ") + ("p.m." if msg_local_date.strftime("%p") == "PM" else "a.m.")}, channel=message["cid"])

