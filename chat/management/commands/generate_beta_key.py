from django.core.management.base import BaseCommand, CommandError

import random

from chat.models import BetaKey

class Command(BaseCommand):
    help = 'Generate a new beta key'

    charset = "azertyuiopqsdfghjklmwxcvbn1234567890AZERTYUIOPQSDFGHJKLMWXCVBN"

    def handle(self, *args, **options):
        
        key = ''.join(random.choice(self.charset) for _ in xrange(50))

        self.stdout.write(key)

        new_key = BetaKey(key=key)
        new_key.save()

        return
