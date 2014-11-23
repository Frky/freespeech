
import json

from ws4redis.publisher import RedisPublisher
from ws4redis.redis_store import RedisMessage

from chat.middlewares.comptoir_list import ComptoirListRequest

class Chat(object):

    connected_users = list()
    audience = dict()

    @classmethod
    def connect(cls, user):
        cls.connected_users.append(user)
        user_cmptrs = [c[0] for c in ComptoirListRequest._comptoir_list(user)]
        for cmptr in user_cmptrs:
            if cmptr.id not in cls.audience.keys():
                cls.audience[cmptr.id] = list()
            cls.audience[cmptr.id].append(user)
        return


    @classmethod
    def disconnect(cls, user):
        cls.connected_users.remove(user)
        for aud in cls.audience.values():
            if user in aud:
                aud.remove(user)


    @classmethod
    def message(cls, user, cid, msg):
        try:
            publisher = RedisPublisher(facility="fsp", users=cls.audience[cid])
        except KeyError:
            print cls.audience
        data = {
                "type": "new-msg",
                "user": user.username,
                "cid": cid, 
                "content": msg,
                "msgdate": "Now",  # TODO
                "mid": 1,          # TODO
            }
        publisher.publish_message(RedisMessage(json.dumps(data)))
