from django.db import models

from django.contrib.auth.models import User

from chat.random_primary import RandomPrimaryIdModel

class IndependantMessage(models.Model):
    owner = models.ForeignKey(User, null=False)
    content = models.CharField(max_length=2048)
    date = models.DateTimeField(auto_now_add=True)


class Comptoir(RandomPrimaryIdModel):
    owner = models.ForeignKey(User, null=True)
    title = models.CharField(max_length=255)
    description = models.CharField(max_length=255, blank=True, null=True)
    public = models.BooleanField(default=True)
    last_message = models.ForeignKey(IndependantMessage, null=True)
    password = models.CharField(max_length=255, default="", blank=True)
    key_hash = models.CharField(max_length=512, default="", blank=False, null=False)
    

class Message(IndependantMessage):
    comptoir = models.ForeignKey(Comptoir, null=False)
