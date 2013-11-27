#-*- coding: utf-8 -*-

from django_socketio import events

from chat.models import Message, Comptoir

@events.on_message(channel="^")
def message(request, socket, context, message):
    comptoir = Comptoir.objects.get(id=message["cid"])
    Message(owner=request.user, comptoir=comptoir, content=message["content"]).save()
    socket.send_and_broadcast_channel({"type": "new-message", "user": request.user.username, "content": message["content"]}, channel=message["cid"])

