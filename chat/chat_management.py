
import json

from ws4redis.publisher import RedisPublisher
from ws4redis.redis_store import RedisMessage

from chat.middlewares.comptoir_list import ComptoirListRequest
from chat.socket_message import NewMessage

class Chat(object):

    connected_users = list()
    audience = dict()

    @classmethod
    def connect(cls, user):
        cls.connected_users.append(user)
        user_cmptrs = [c[0] for c in ComptoirListRequest._comptoir_list(user)]
        users_to_notify = list()
        online_users = dict()
        for cmptr in user_cmptrs:
            if cmptr.id not in cls.audience.keys():
                cls.audience[cmptr.id] = list()
            users_to_notify += cls.audience[cmptr.id]
            online_users[cmptr.id] = cls.audience[cmptr.id]
            cls.audience[cmptr.id].append(user)
        publisher = RedisPublisher(facility="fsp", users=set(users_to_notify))
#        publisher.publish_message(RedisMessage(
        return


    @classmethod
    def disconnect(cls, user):
        cls.connected_users.remove(user)
        for aud in cls.audience.values():
            if user in aud:
                aud.remove(user)


    @classmethod
    def message(cls, user, cid, msg):
        ## TODO:
        #   • Check hash
        #   • Check if content is empty
        #   • Check whatever is checked in events.py
        ##
        try:
            publisher = RedisPublisher(facility="fsp", users=cls.audience[cid])
        except KeyError:
            print cls.audience
        msg = NewMessage(user, cid, msg)
        publisher.publish_message(msg.redis())
