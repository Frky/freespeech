from django.db import models

from django.contrib.auth.models import User

from chat.random_primary import RandomPrimaryIdModel


class IndependantMessage(models.Model):
    owner = models.ForeignKey(User, null=False)
    content = models.CharField(max_length=2048)
    date = models.DateTimeField(auto_now_add=True)
    last_edit = models.DateTimeField(auto_now=True, null=True)


class Comptoir(RandomPrimaryIdModel):
    owner = models.ForeignKey(User, null=True)
    title = models.CharField(max_length=255)
    description = models.CharField(max_length=255, blank=True, null=True)
    public = models.BooleanField(default=True)
    last_message = models.ForeignKey(IndependantMessage, null=True)
    key_hash = models.CharField(max_length=512, default="", blank=True, null=True)
    

class Message(IndependantMessage):
    comptoir = models.ForeignKey(Comptoir, null=False)


class LastVisit(models.Model):
    comptoir = models.ForeignKey(Comptoir, null=False)
    date = models.DateTimeField(auto_now_add=True)


class BetaKey(models.Model):
    key = models.CharField(max_length=100, blank=False)
    used = models.BooleanField(default=False)


class BugReport(models.Model):
    url = models.CharField(max_length=50, blank=True)
    date_submission = models.DateTimeField(auto_now_add=True)
    date_fix = models.DateTimeField(auto_now_add=False, null=True)
    priority = models.IntegerField(default=5)
    treated = models.BooleanField(default=False)
    reporter = models.ForeignKey(User, null=True)
    description = models.CharField(max_length=500, blank=False)


class ChatUser(models.Model):
    user = models.OneToOneField(User)
    last_visits = models.ManyToManyField(LastVisit)

