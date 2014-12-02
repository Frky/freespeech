
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
        self.typ = [kwargs["type"] if "type" in kwargs.keys() else ""]
        self.typ = [kwargs["type"] if "type" in kwargs.keys() else ""]
        self.typ = [kwargs["type"] if "type" in kwargs.keys() else ""]
        self.typ = [kwargs["type"] if "type" in kwargs.keys() else ""]

    def json(self):
        data = dict()
        data["type"] = self.typ
        return json(data)

    def save(self):
        msg = Message(owner=self.user, comptoir=self.cmptr, content=self.content, me_message=False)
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

    def __init__(self, user, cmptr, content):
        self.typ = "new-msg"
        self.user = user
        self.cmptr = cmptr
        self.content = content
        self.mid = -1
        self.date = ""
        self.save()

    def json(self):
       data = dict()
       data["type"] = self.typ
       data["user"] = self.user.username
       data["cid"] = self.cmptr.id
       data["content"] = self.content
       data["msgdate"] = self.date
       data["mid"] = self.mid
       return json.dumps(data)


class Wizz(SocketMessage):

    def __init__(self, user, cmptr):
        self.typ = "wizz"
        self.user = user
        self.cmptr = cmptr

    def json(self):
       data = dict()
       data["type"] = self.typ
       data["user"] = self.user.username
       data["cid"] = self.cmptr.id
       return json.dumps(data)


