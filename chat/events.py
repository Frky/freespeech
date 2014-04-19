#-*- coding: utf-8 -*-

from django.contrib.sessions.models import Session
from django.contrib.auth.models import User
from django_socketio import events

from chat.models import Message, Comptoir
from chat.middlewares.comptoir_list import ComptoirListRequest

import pytz

from freespeech.settings import TIME_ZONE

from django.utils.timezone import utc
from django.core.exceptions import ObjectDoesNotExist

from chat.models import ChatUser, LastVisit
from chat.utils import date_to_tooltip

import datetime

connected_users = dict()
timezone_local = pytz.timezone(TIME_ZONE)

def get_all_users():
    all_users = list()
    for cuser in connected_users.values():
        all_users += cuser
    return list(set(all_users))

@events.on_disconnect(channel="^")
def leaving(request, socket, context):

    try:
        user = User.objects.get(username=context["username"])
        cid = context["cid"]
    except KeyError:
        return

    comptoir = Comptoir.objects.get(id=cid)

    if not hasattr(user, 'chatuser'):
        ChatUser(user=user).save()
    try:
        lv = user.chatuser.last_visits.filter(comptoir=comptoir)
        if len(lv) > 1:
            for extra_lv in user.chatuser.last_visits.get(comptoir=comptoir):
                extra_lv.delete()
            lv = LastVisit(comptoir=comptoir)
            lv.save()
            user.chatuser.last_visits.add(lv)
            user.chatuser.last_visits.save()
        else:
            lv = lv[0]
    except ObjectDoesNotExist:
        lv = LastVisit(comptoir=comptoir)
        lv.save()
        user.chatuser.last_visits.add(lv)
        user.chatuser.last_visits.save()

    lv.date = datetime.datetime.utcnow().replace(tzinfo=utc)
    lv.save()
    
    connected_users[cid] = filter(lambda a: a[1] != socket, connected_users[cid])

    socket.send_and_broadcast_channel({"type": "users", "users_list": list(set([c[0] for c in connected_users[cid]]))}, channel=cid)



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
            
        connected_users[cid].append((user.username, socket))
        # socket.send_and_broadcast({"type": "users", "users_list": get_all_users()})
        socket.send_and_broadcast_channel({"type": "users", "users_list": list(set([u[0] for u in connected_users[cid]]))}, channel=message["cid"])

        user_cmptrs = [c[0] for c in ComptoirListRequest._comptoir_list(user)]


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
    
            socket.send_and_broadcast_channel({"type": "new-message", "user": user.username, "content": message["content"], "msgdate": date_to_tooltip(msg_local_date)}, channel=message["cid"])

            for other_user in get_all_users():
                other_user_cmptrs = [c[0] for c in ComptoirListRequest._comptoir_list(User.objects.get(username=other_user[0]))]
                if comptoir in other_user_cmptrs and other_user[0] != user.username and other_user not in connected_users[message["cid"]]:
                    other_user[1].send({"type": "update-badge", "cid": message["cid"], "user": user.username, "msgdate": date_to_tooltip(msg_local_date)})

