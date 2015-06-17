from django.core.management.base import BaseCommand, CommandError

from chat.models import ChatUser

class Command(BaseCommand):
    help = 'Disconnect all users in the DB'

    def handle(self, *args, **options):
        for u in ChatUser.objects.all():
            if u.connected or u.nb_ws > 0:
                u.nb_ws = 0
                u.connected = False
                u.save()
