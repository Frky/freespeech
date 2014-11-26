
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
        comptoir = Comptoir.objects.get(id=self.cid)
        msg = Message(owner=self.user, comptoir=comptoir, content=self.content, me_message=False)
        msg.save()
        comptoir.last_message = msg
        comptoir.save()
        msg_date = msg.date.astimezone(timezone_local)
        self.date = date_to_tooltip(msg_date)
        self.mid = msg.id


class NewMessage(SocketMessage):

    def __init__(self, user, cid, content):
        self.typ = "new-msg"
        self.user = user
        self.cid = cid
        self.content = content
        self.mid = -1
        self.date = ""
        self.save()

    def json(self):
       data = dict()
       data["type"] = self.typ
       data["user"] = self.user.username
       data["cid"] = self.cid
       data["content"] = self.content
       data["msgdate"] = self.date
       data["mid"] = self.mid
       return json.dumps(data)

    def redis(self):
       return RedisMessage(self.json())
