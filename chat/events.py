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


@events.on_disconnect(channel="^")
def leaving(request, socket, context):

    # Try to get the user entry from the dictionary
    try:
        user_entry = filter(lambda x: x[1][0] == socket, connected_users.items())[0]
    except IndexError:
        return
    session, user_infos = user_entry[0], user_entry[1]
    # Iteration on all connected users
    for other_user in connected_users.values():
        # Skipping for the user that left
        if other_user == user_entry:
            continue
        # Getting information on the other user
        osock, ouser, ocmptrs, ocid = other_user[0], other_user[1], other_user[2], other_user[3]
        # Computing the common list of comptoirs
        common_cid = [c.id for c in set(ocmptrs).intersection(set(user_infos[2]))]
        # If this list is not empty
        if len(common_cid) > 0:
            # We notify that the user has left
            osock.send({"type": "left", "user": user_infos[1].username})
    # Remove the entry of the left user from the dictionary
    connected_users.pop(session)


def identify(socket, session_key):
    # Getting session object from session key
    session = Session.objects.get(session_key=session_key)
    # Getting user corresponding to the session key
    uid = session.get_decoded().get('_auth_user_id')
    user = User.objects.get(pk=uid)
    # If the user is not logged in, return
    if not user.is_authenticated() or user.is_anonymous():
        return
    # Get all comptoirs related to the user
    user_cmptrs = [c[0] for c in ComptoirListRequest._comptoir_list(user)]
    # If the user is already present with another socket
    if user in [ui[1] for ui in connected_users.values()]:
        connected_users[session_key] = ((socket, user, user_cmptrs, None))
        # Updating the socket
    else:
        # Creation of a new entry in the dictionary
        connected_users[session_key] = ((socket, user, user_cmptrs, None))
    return


@events.on_message(channel="^")
def message(request, socket, context, message):

    try:
        action = message["action"]
        session_key = message["session_key"]
    except KeyError:
        print "Session key error."
        return

    if action == "join":
        # Try to get the user from the dictionary
        try:
            user_entry = connected_users[session_key]
        except KeyError:
            print "Key Error."
            return
        # If the user is not logged in, reject the joining
        if not user_entry[1].is_authenticated() or user_entry[1].is_anonymous():
            print "User error."
            return
        # Updating the current comptoir of the user
        connected_users[session_key] = (user_entry[0], user_entry[1], user_entry[2], message["cid"])

    elif action == "identification":
        # Identification of the new user with the session key
        identify(socket, session_key)
        # Getting user entry in the dictionary
        user_entry = connected_users[session_key]
        # Iteration on all users
        for other_user in connected_users.values():
                osock, ouser, ocmptrs, ocid = other_user[0], other_user[1], other_user[2], other_user[3]
                # Computing the common comptoirs between the new user and each other user
                common_cid = [c.id for c in set(ocmptrs).intersection(set(user_entry[2]))]
                # If there are some common comptoirs
                if len(common_cid) > 0:
                    # We notify both entites that the other is connected
                    user_entry[0].send({"type": "joined", "user": ouser.username, "cmptrs": common_cid})
                    osock.send({"type": "joined", "user": user_entry[1].username, "cmptrs": common_cid})

    elif action == "post":
        # Get user information from dictionary
        user = connected_users[session_key][1]
        # Get cid where to post the message
        cid = message["cid"]
        # Get the corresponding comptoir object
        comptoir = Comptoir.objects.get(id=cid)
        # If the hash of the comptoir key does not match with the db
        if (comptoir.key_hash != message["hash"]):
            # We reject the message
            socket.send({"type": "error", "error_msg": "Your message was rejected because your key is not valid."})
            socket.send({"type": "ack"})
            return
        # If the message is empty, reject it
        if message["content"] == "":
            socket.send({"type": "error", "error_msg": "Your message was rejected because it is empty."})
            socket.send({"type": "ack"})
            return
        # Try to determine if this is a '/me' message or not
        try:
            me_msg = message["me_msg"]
        except KeyError:
            me_msg = False
        # Creation of a new message object
        msg = Message(owner=user, comptoir=comptoir, content=message["content"], me_message=me_msg)
        # Saving the message
        msg.save()
        # Updating last message on the comptoir
        comptoir.last_message = msg
        comptoir.save()
        # At this point the date of the message is in utc format, so we need to correct it 
        msg_local_date = msg.date.astimezone(timezone_local)
        # Iteration on each connected user to deliver the new message
        for other_user in connected_users.values():
            osock, ouser, ocmptrs, ocid = other_user[0], other_user[1], other_user[2], other_user[3]
            # if the user is the one that posted the message
            if ouser == user:
                # Send acknoledgement
                socket.send({"type": "ack"})
            # If the currently iterated user is related to the comptoir
            if comptoir in ocmptrs:
                # If the comptoir is not the one where the user is connected (and if the user is not the one
                # that posted the message)
                if ocid != cid and ouser != user:
                    # We just send an update-badge message
                    osock.send({"type": "update-badge", "cid": message["cid"], "user": user.username, "msgdate": date_to_tooltip(msg_local_date)})
                else:
                    # Else we deliver the message
                    osock.send({
                                "type": "new-message", 
                                "cid": message["cid"], 
                                "user": user.username, 
                                "content": message["content"], 
                                "me_msg": me_msg, 
                                "msgdate": date_to_tooltip(msg_local_date), 
                                "mid": msg.id,
                                })

    elif action == "edit-msg":
        # Get user from dictionary
        user = connected_users[session_key][1]
        # Get the socket of the user
        sock = connected_users[session_key][0]
        # Get cid where to edit the message
        cid = message["cid"]
        # Get the corresponding comptoir object
        comptoir = Comptoir.objects.get(id=cid)
        # Get the id of the message to edit
        mid = message["mid"]
        # Get the message object
        msg = Message.objects.get(id=mid)
        # Check the owner of the message
        if msg.owner != user:
            sock.send({"type": "error", "error_msg": "You cannot edit a message that does not belong to you. The new message has not been saved on the server."})
            return
        if msg.content != message["oldmsg"]:
            sock.send({"type": "error", "error_msg": "The edition has failed. The new message has not been saved on the server."})
            return
        # If the hash of the comptoir key does not match with the db
        if (comptoir.key_hash != message["hash"]):
            # We reject the message
            socket.send({"type": "error", "error_msg": "Edition was rejected because your key is not valid."})
            return
        # Update message content
        msg.content = message["newmsg"]
        msg.edited = True
        # Save modification
        msg.save()
        # Propagate the edition to connected users
        for other_user in connected_users.values():
            osock, ouser, ocmptrs, ocid = other_user[0], other_user[1], other_user[2], other_user[3]
            # If the currently iterated user is related to the comptoir
            if cid == ocid:
                # We notify the modification
                osock.send({"type": "edit-msg", "cid": message["cid"], "mid": mid, "content": message["newmsg"]})

    # To be commented
    elif action == "wizz":
        user = connected_users[session_key][1]
        cid = message["cid"]
        comptoir = Comptoir.objects.get(id=cid)
        context["cid"] = cid
        context["username"] = user.username

        if (comptoir.key_hash != message["hash"]):
            socket.send({"type": "error", "error_msg": "Your wizz was rejected because your key is not valid."})
        else:
            for other_user in connected_users.values(): 
                osock, ouser, ocmptrs, ocid = other_user[0], other_user[1], other_user[2], other_user[3]
                if comptoir in ocmptrs:
                    if ocid == cid:
                        osock.send({"type": "wizz", "from": user.username}) 

