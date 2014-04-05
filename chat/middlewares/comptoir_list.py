from django.conf import settings
from django.template import RequestContext

from chat.models import Comptoir, ChatUser, Message, LastVisit


class ComptoirListRequest(object):
    
    def _comptoir_list(self, request):
        
        user = request.user
        if not user.is_authenticated or user.username == "AnonymousUser":
            user_id = 0
        else:
            user_id = user.id
    
        my_comptoirs = list()
       
        comptoirs = Comptoir.objects.all()
    
        for lv in user.chatuser.last_visits.all():
            cmpt = lv.comptoir
            date = lv.date
            new_msgs = 0
            msg = Message.objects.all().filter(comptoir=cmpt.id)
            for m in [ ms for ms in msg if ms.owner != user.id]:
                if lv.date < m.date:
                    new_msgs += 1
            my_comptoirs.append((cmpt, new_msgs))
    
        return my_comptoirs


    def process_request(self, request):
        request.user.comptoirs = self._comptoir_list(request)
        return None


    def process_response(self, request, response):
        return response

