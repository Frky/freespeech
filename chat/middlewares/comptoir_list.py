from django.conf import settings
from django.template import RequestContext

from chat.models import Comptoir, ChatUser, Message, LastVisit


class ComptoirListRequest(object):
    
    @classmethod
    def _comptoir_list(cls, user):

        if (not user.is_authenticated() or user.is_anonymous()):
            return list()
        else:
            user_id = user.id
    
        my_comptoirs = list()
       
        comptoirs = Comptoir.objects.all()

        for lv in user.chatuser.last_visits.all():
            cmpt = lv.comptoir
            date = lv.date
            new_msgs = 0
            msg = Message.objects.exclude(date__lt=lv.date).filter(comptoir=cmpt.id)
            new_msgs = len([m for m in msg if m.owner != user])
            my_comptoirs.append((cmpt, new_msgs))
    
        return my_comptoirs


    def process_request(self, request):
        request.user.comptoirs = ComptoirListRequest._comptoir_list(request.user)
        return None


    def process_response(self, request, response):
        return response

