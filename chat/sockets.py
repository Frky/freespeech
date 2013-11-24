import logging

from socketio.namespace import BaseNamespace
from socketio.mixins import RoomsMixin, BroadcastMixin
from socketio.sdjango import namespace

@namespace('/chat')
class ChatNamespace(BaseNamespace, RoomsMixin, BroadcastMixin):

    def initialize(self):
        self.logger = logging.getLogger("socketio.chat")
        self.log("Socketio session started")
        
    def on_user_message(self, msg):
        self.log('User message: {0}'.format(msg))
        self.emit_to_room(self.room, 'msg_to_room',
            self.socket.session['nickname'], msg)
        return True
