
from ws4redis.redis_store import RedisMessage
import json
import pytz
from freespeech.settings import TIME_ZONE

from chat.models import Message, Comptoir
from chat.utils import date_to_tooltip

timezone_local = pytz.timezone(TIME_ZONE)

class SocketMessage(object):

    def __init__(self, *args, **kwargs):
        self.typ = "generic"

    def json(self):
        data = dict()
        data["type"] = self.typ
        return json(data)

    def save(self):
        print "SAVING"
        msg = Message(owner=self.user, comptoir=self.cmptr, content=self.content, me_message=self.me_msg)
        msg.save()
        self.cmptr.last_message = msg
        self.cmptr.save()
        msg_date = msg.date.astimezone(timezone_local)
        self.date = date_to_tooltip(msg_date)
        self.mid = msg.id

    def json(self):
        raise NotImplemented

    def redis(self):
       return RedisMessage(self.json())
    

class ConnectionMessage(SocketMessage):

    def __init__(self, username, cid):
        self.typ = "joined"
        self.username = username
        self.cid = cid

    def json(self):
        data = dict()
        data["type"] = self.typ
        data["user"] = self.username
        data["cid"] = self.cid
        return json.dumps(data)


class ConnectedMessage(ConnectionMessage):
    def __init__(self, username, cid):
        super(ConnectedMessage, self).__init__(username, cid)
        self.typ = "connected"


class DisconnectionMessage(SocketMessage):

    def __init__(self, username, cid):
        self.typ = "left"
        self.username = username
        self.cid = cid

    def json(self):
        data = dict()
        data["type"] = self.typ
        data["user"] = self.username
        data["cid"] = self.cid
        return json.dumps(data)


class NewMessage(SocketMessage):

    def __init__(self, user, cmptr, content, me_msg, keep):
        self.typ = "new-msg"
        self.user = user
        self.cmptr = cmptr
        self.content = content
        self.me_msg = me_msg
        self.mid = -1
        self.date = ""
        if keep:
            self.save()

    def json(self):
       data = dict()
       data["type"] = self.typ
       data["user"] = self.user.username
       data["cid"] = self.cmptr.id
       data["content"] = self.content
       data["msgdate"] = self.date
       data["mid"] = self.mid
       data["me_msg"] = self.me_msg
       return json.dumps(data)


class Wizz(SocketMessage):

    def __init__(self, user, cmptr, content, keep):
        self.typ = "wizz"
        self.user = user
        self.cmptr = cmptr
        self.content = content
        self.me_msg = False
        if keep:
            self.save()

    def json(self):
       data = dict()
       data["type"] = self.typ
       data["user"] = self.user.username
       data["cid"] = self.cmptr.id
       return json.dumps(data)


class Edition(SocketMessage):

    def __init__(self, cmptr, msg):
        self.typ = "edit-msg"
        self.cmptr = cmptr
        self.msg = msg

    def json(self):
       data = dict()
       data["type"] = self.typ
       data["cid"] = self.cmptr.id
       data["mid"] = self.msg.id
       data["content"] = self.msg.content
       return json.dumps(data)

