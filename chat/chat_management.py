
import json

from ws4redis.publisher import RedisPublisher
from ws4redis.redis_store import RedisMessage

from chat.models import Comptoir, Message, ChatUser, User
from chat.middlewares.comptoir_list import ComptoirListRequest
from chat.socket_message import DisconnectionMessage, ConnectionMessage, NewMessage, Wizz, Edition, ConnectedMessage
from chat.chat_errors import hash_error, owner_error, old_content_error

from time import sleep

class Chat(object):

    connected_users = list()
    audience = dict()

    @classmethod
    def get_audience(cls, cids):
        audience = dict()
        for cid in cids:
            audience[cid] = list()
        for u in ChatUser.objects.all():
            if not u.connected:
                u = User.objects.get(id = u.id)
                continue
            u = User.objects.get(id = u.id)
            u_cmptrs = [c[0].id for c in ComptoirListRequest._comptoir_list(u)]
            for cid in u_cmptrs:
                if cid in cids:
                    audience[cid].append(u)
        return audience


    @classmethod
    def connect(cls, user):
        u = ChatUser.objects.get(id=user.id)
        if u.connected == True:
            sleep(2)
        u = ChatUser.objects.get(id=user.id)
        u.connected = True
        u.nb_ws += 1
        u.save()
        user_cmptrs = [c[0] for c in ComptoirListRequest._comptoir_list(user)]
        audience = dict()
        for c in user_cmptrs:
            audience[c.id] = list()
        for u in ChatUser.objects.all():
            if not u.connected or u == user:
                continue
            u = User.objects.get(id = u.id)
            u_cmptrs = [c[0].id for c in ComptoirListRequest._comptoir_list(u)]
            for cid in u_cmptrs:
                if cid in audience.keys():
                    audience[cid].append(u)
                    publisher = RedisPublisher(facility="fsp", users=[u])
                    notif_msg = ConnectionMessage(user.username, cid)
                    publisher.publish_message(notif_msg.redis())
        for cid, connected in audience.items():
            for u in connected:
                publisher = RedisPublisher(facility="fsp", users=[user])
                notif_msg = ConnectedMessage(u.username, cid)
                publisher.publish_message(notif_msg.redis())
        return
            
        cls.connected_users.append(user)
        users_to_notify = list()
        online_users = dict()
        for cmptr in user_cmptrs:
            if cmptr.id not in cls.audience.keys():
                cls.audience[cmptr.id] = list()
            publisher = RedisPublisher(facility="fsp", users=cls.audience[cmptr.id])
            notif_msg = ConnectionMessage(user.username, cmptr.id)
            publisher.publish_message(notif_msg.redis())
            for u in cls.audience[cmptr.id]:
                publisher = RedisPublisher(facility="fsp", users=[user])
                notif_msg = ConnectedMessage(u.username, cmptr.id)
                publisher.publish_message(notif_msg.redis())
            cls.audience[cmptr.id].append(user)
        return


    @classmethod
    def disconnect(cls, user):
        sleep(2)
        u = ChatUser.objects.get(id=user.id)
        u.nb_ws -= 1
        u.save()
        if u.nb_ws <= 0:
            u.nb_ws = 0
            u.connected = False
            u.save()
        else:
            return
        user_cmptrs = [c[0].id for c in ComptoirListRequest._comptoir_list(user)]
        audience = cls.get_audience(user_cmptrs)
        for u in set(reduce(lambda a,b: a+b, audience.values(), [])):
            publisher = RedisPublisher(facility="fsp", users=[u])
            notif_msg = DisconnectionMessage(user.username)
            publisher.publish_message(notif_msg.redis())
        return


    @classmethod
    def message(cls, user, cid, chash, msg, me_msg, keep):
        ## TODO:
        #   - Check hash
        #   - Check if content is empty
        #   - Check whatever is checked in events.py
        ##
        cmptr = Comptoir.objects.get(id=cid)
        # If the hash of the comptoir key does not match with the db
        if (cmptr.key_hash != chash):
            # We reject the message
            publisher = RedisPublisher(facility="fsp", users=[user])
            publisher.publish_message(RedisMessage(hash_error))
        else:    
            audience = cls.get_audience([cid])
            publisher = RedisPublisher(facility="fsp", users=audience[cid])
            msg = NewMessage(user, cmptr, msg, me_msg, keep)
            publisher.publish_message(msg.redis())


    @classmethod
    def wizz(cls, user, cid, chash, content, keep):
        cmptr = Comptoir.objects.get(id=cid)
        if (cmptr.key_hash != chash):
            # We reject the message
            publisher = RedisPublisher(facility="fsp", users=user)
            publisher.publish_message(RedisMessage(hash_error))
        else:    
            audience = cls.get_audience([cid])
            publisher = RedisPublisher(facility="fsp", users=audience[cid])
            wizz_msg = Wizz(user, cmptr, content, keep)
            publisher.publish_message(wizz_msg.redis())


    @classmethod
    def edit(cls, user, cid, chash, mid, old_content, new_content):
        cmptr = Comptoir.objects.get(id=cid)
        # Check hash
        if cmptr.key_hash != chash:
            publisher = RedisPublisher(facility="fsp", users=[user])
            publisher.publish_message(RedisMessage(hash_error))
            return
        msg = Message.objects.get(id=mid)
        # Check owner
        if msg.owner != user:
            publisher = RedisPublisher(facility="fsp", users=[user])
            publisher.publish_message(RedisMessage(owner_error))
            return
        # Check old content
        if msg.content != old_content or old_content == "":
            publisher = RedisPublisher(facility="fsp", users=[user])
            publisher.publish_message(RedisMessage(old_content_error))
            return
        print "Go on"
        # Editing content
        msg.content = new_content
        msg.edited = True
        msg.save()
        audience = cls.get_audience([cid])
        publisher = RedisPublisher(facility="fsp", users=audience[cid])
        edit_msg = Edition(cmptr, msg)
        publisher.publish_message(edit_msg.redis())

