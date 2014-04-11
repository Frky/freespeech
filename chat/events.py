#-*- coding: utf-8 -*-

from django.contrib.sessions.models import Session
from django.contrib.auth.models import User
from django_socketio import events

from chat.models import Message, Comptoir

import pytz

from freespeech.settings import TIME_ZONE

from django.utils.timezone import utc
from django.core.exceptions import ObjectDoesNotExist

from chat.models import ChatUser, LastVisit

import datetime

connected_users = dict()
timezone_local = pytz.timezone(TIME_ZONE)

@events.on_disconnect(channel="^")
def leaving(request, socket, context):

    if request.user.username == "AnonymousUser" or not request.user.is_authenticated():
        return

    try:
        user = context["username"]
        cid = context["cid"]
    except KeyError:
        return

    comptoir = Comptoir.objects.get(id=cid)

    if not hasattr(request.user, 'chatuser'):
        ChatUser(user=request.user).save()
    try:
        lv = request.user.chatuser.last_visits.filter(comptoir=comptoir)
        if len(lv) > 1:
            for extra_lv in request.user.chatuser.last_visits.get(comptoir=comptoir):
                extra_lv.delete()
            lv = LastVisit(comptoir=comptoir)
            lv.save()
            request.user.chatuser.last_visits.add(lv)
        else:
            lv = lv[0]
    except ObjectDoesNotExist:
        lv = LastVisit(comptoir=comptoir)
        lv.save()
        request.user.chatuser.last_visits.add(lv)

    lv.date = datetime.datetime.utcnow().replace(tzinfo=utc)
    lv.save()
    
    try:
        connected_users[cid].remove(user)
    except ValueError:
        return
    socket.send_and_broadcast_channel({"type": "users", "users_list": connected_users[cid]}, channel=cid)


@events.on_message(channel="^")
def message(request, socket, context, message):
    comptoir = Comptoir.objects.get(id=message["cid"])
    session = Session.objects.get(session_key=message['session_key'])
    uid = session.get_decoded().get('_auth_user_id')
    user = User.objects.get(pk=uid)
   
    action = message["action"]

    if action == "join": # and comptoir.key_hash == message["hash"]:
        if not user.is_authenticated or user.username == "AnonymousUser":
            return
        context["username"] = user.username
        context["cid"] = message["cid"]
        cid = context["cid"]
        if cid not in connected_users:
            connected_users[cid] = list()
        if user.username not in connected_users[cid]:
            connected_users[cid].append(user.username)
        socket.send_and_broadcast_channel({"type": "users", "users_list": connected_users[cid]}, channel=cid)

    elif action == "post":
        if (comptoir.key_hash != message["hash"]):
            socket.send({"type": "error", "error_msg": "Your message was rejected because your key is not valid."})
    
        else:
            msg = Message(owner=user, comptoir=comptoir, content=message["content"])
            msg.save()
            comptoir.last_message = msg
            comptoir.save()
    
            # At this point the date of the message is in utc format, so we need to correct it 
            msg_local_date = msg.date.astimezone(timezone_local)
    
            socket.send_and_broadcast_channel({"type": "new-message", "user": user.username, "content": message["content"], "msgdate": msg_local_date.strftime("%b. %e, %Y, %l:%M ") + ("p.m." if msg_local_date.strftime("%p") == "PM" else "a.m.")}, channel=message["cid"])

