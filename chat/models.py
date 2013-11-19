from django.db import models

from django.contrib.auth.models import User

from random_primary import RandomPrimaryIdModel


class Comptoir(RandomPrimaryModel):
    title = models.CharField(max_length=255)
    description = models.CharField(max_length=255, blank=True, null=True)
    public = models.BooleanField(default=True)
    password = models.CharField(max_length=255, default="", blank=True)
    

class Message(models.Model):
    owner = models.ForeignKey(User, null=False)
    comptoir = models.ForeignKey(Comptoir, null=False)
    content = models.CharField(max_length=2048)
    date = models.DateTimeField(auto_now_add=True)
