
import json

from ws4redis.publisher import RedisPublisher
from ws4redis.redis_store import RedisMessage

from chat.models import Comptoir
from chat.middlewares.comptoir_list import ComptoirListRequest
from chat.socket_message import ConnectionMessage, NewMessage, Wizz
from chat.chat_errors import hash_error

class Chat(object):

    connected_users = list()
    audience = dict()

    @classmethod
    def connect(cls, user):
        print "Connected"
        cls.connected_users.append(user)
        user_cmptrs = [c[0] for c in ComptoirListRequest._comptoir_list(user)]
        users_to_notify = list()
        online_users = dict()
        for cmptr in user_cmptrs:
            if cmptr.id not in cls.audience.keys():
                cls.audience[cmptr.id] = list()
            publisher = RedisPublisher(facility="fsp", users=cls.audience[cmptr.id])
            notif_msg = ConnectionMessage(user.username, cmptr.id)
            publisher.publish_message(notif_msg.redis())
            cls.audience[cmptr.id].append(user)
        return


    @classmethod
    def disconnect(cls, user):
        print "Disconnected"
        cls.connected_users.remove(user)
        for cid, aud in cls.audience.items():
            if user in aud:
                aud.remove(user)
                publisher = RedisPublisher(facility="fsp", users=cls.audience[aud])
                notif_msg = DisconnectionMessage(user.username, cid)
                publisher.publish_message(notif_msg.redis())


    @classmethod
    def message(cls, user, cid, chash, msg, me_msg):
        ## TODO:
        #   - Check hash
        #   - Check if content is empty
        #   - Check whatever is checked in events.py
        ##
        cmptr = Comptoir.objects.get(id=cid)
        # If the hash of the comptoir key does not match with the db
        if (cmptr.key_hash != chash):
            # We reject the message
            publisher = RedisPublisher(facility="fsp", users=user)
            publisher.publish_message(RedisMessage(hash_error))
        else:    
            try:
                publisher = RedisPublisher(facility="fsp", users=cls.audience[cid])
            except KeyError:
                print cls.audience
            msg = NewMessage(user, cmptr, msg, me_msg)
            publisher.publish_message(msg.redis())


    @classmethod
    def wizz(cls, user, cid, chash, content):
        ## TODO:
        #   - Check hash
        ##
        cmptr = Comptoir.objects.get(id=cid)
        if (cmptr.key_hash != chash):
            # We reject the message
            publisher = RedisPublisher(facility="fsp", users=user)
            publisher.publish_message(RedisMessage(hash_error))
        else:    
            try:
                publisher = RedisPublisher(facility="fsp", users=cls.audience[cid])
            except KeyError:
                print cls.audience
            wizz_msg = Wizz(user, cmptr, content)
            publisher.publish_message(wizz_msg.redis())

