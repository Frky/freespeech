# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'IndependantMessage'
        db.create_table(u'chat_independantmessage', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('owner', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['auth.User'])),
            ('content', self.gf('django.db.models.fields.CharField')(max_length=2048)),
            ('date', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('last_edit', self.gf('django.db.models.fields.DateTimeField')(auto_now=True, null=True, blank=True)),
            ('edited', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('me_message', self.gf('django.db.models.fields.BooleanField')(default=False)),
        ))
        db.send_create_signal(u'chat', ['IndependantMessage'])

        # Adding model 'Comptoir'
        db.create_table(u'chat_comptoir', (
            ('id', self.gf('django.db.models.fields.CharField')(unique=True, max_length=10, primary_key=True, db_index=True)),
            ('owner', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['auth.User'], null=True)),
            ('title', self.gf('django.db.models.fields.CharField')(max_length=255)),
            ('description', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('public', self.gf('django.db.models.fields.BooleanField')(default=True)),
            ('last_message', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['chat.IndependantMessage'], null=True)),
            ('key_hash', self.gf('django.db.models.fields.CharField')(default='', max_length=512, null=True, blank=True)),
            ('title_is_ciphered', self.gf('django.db.models.fields.BooleanField')(default=False)),
        ))
        db.send_create_signal(u'chat', ['Comptoir'])

        # Adding model 'Message'
        db.create_table(u'chat_message', (
            (u'independantmessage_ptr', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['chat.IndependantMessage'], unique=True, primary_key=True)),
            ('comptoir', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['chat.Comptoir'])),
        ))
        db.send_create_signal(u'chat', ['Message'])

        # Adding model 'LastVisit'
        db.create_table(u'chat_lastvisit', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('comptoir', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['chat.Comptoir'])),
            ('date', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
        ))
        db.send_create_signal(u'chat', ['LastVisit'])

        # Adding model 'BetaKey'
        db.create_table(u'chat_betakey', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('key', self.gf('django.db.models.fields.CharField')(max_length=100)),
            ('used', self.gf('django.db.models.fields.BooleanField')(default=False)),
        ))
        db.send_create_signal(u'chat', ['BetaKey'])

        # Adding model 'BugReport'
        db.create_table(u'chat_bugreport', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('url', self.gf('django.db.models.fields.CharField')(max_length=50, blank=True)),
            ('date_submission', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('date_fix', self.gf('django.db.models.fields.DateTimeField')(null=True)),
            ('priority', self.gf('django.db.models.fields.IntegerField')(default=5)),
            ('treated', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('reporter', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['auth.User'], null=True)),
            ('description', self.gf('django.db.models.fields.CharField')(max_length=500)),
        ))
        db.send_create_signal(u'chat', ['BugReport'])

        # Adding model 'ChatUser'
        db.create_table(u'chat_chatuser', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('user', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['auth.User'], unique=True)),
        ))
        db.send_create_signal(u'chat', ['ChatUser'])

        # Adding M2M table for field last_visits on 'ChatUser'
        m2m_table_name = db.shorten_name(u'chat_chatuser_last_visits')
        db.create_table(m2m_table_name, (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('chatuser', models.ForeignKey(orm[u'chat.chatuser'], null=False)),
            ('lastvisit', models.ForeignKey(orm[u'chat.lastvisit'], null=False))
        ))
        db.create_unique(m2m_table_name, ['chatuser_id', 'lastvisit_id'])


    def backwards(self, orm):
        # Deleting model 'IndependantMessage'
        db.delete_table(u'chat_independantmessage')

        # Deleting model 'Comptoir'
        db.delete_table(u'chat_comptoir')

        # Deleting model 'Message'
        db.delete_table(u'chat_message')

        # Deleting model 'LastVisit'
        db.delete_table(u'chat_lastvisit')

        # Deleting model 'BetaKey'
        db.delete_table(u'chat_betakey')

        # Deleting model 'BugReport'
        db.delete_table(u'chat_bugreport')

        # Deleting model 'ChatUser'
        db.delete_table(u'chat_chatuser')

        # Removing M2M table for field last_visits on 'ChatUser'
        db.delete_table(db.shorten_name(u'chat_chatuser_last_visits'))


    models = {
        u'auth.group': {
            'Meta': {'object_name': 'Group'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '80'}),
            'permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'})
        },
        u'auth.permission': {
            'Meta': {'ordering': "(u'content_type__app_label', u'content_type__model', u'codename')", 'unique_together': "((u'content_type', u'codename'),)", 'object_name': 'Permission'},
            'codename': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['contenttypes.ContentType']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        u'auth.user': {
            'Meta': {'object_name': 'User'},
            'date_joined': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'blank': 'True'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'groups': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'related_name': "u'user_set'", 'blank': 'True', 'to': u"orm['auth.Group']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'is_staff': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_superuser': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'last_login': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'user_permissions': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'related_name': "u'user_set'", 'blank': 'True', 'to': u"orm['auth.Permission']"}),
            'username': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '30'})
        },
        u'chat.betakey': {
            'Meta': {'object_name': 'BetaKey'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'key': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'used': ('django.db.models.fields.BooleanField', [], {'default': 'False'})
        },
        u'chat.bugreport': {
            'Meta': {'object_name': 'BugReport'},
            'date_fix': ('django.db.models.fields.DateTimeField', [], {'null': 'True'}),
            'date_submission': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'description': ('django.db.models.fields.CharField', [], {'max_length': '500'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'priority': ('django.db.models.fields.IntegerField', [], {'default': '5'}),
            'reporter': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['auth.User']", 'null': 'True'}),
            'treated': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'url': ('django.db.models.fields.CharField', [], {'max_length': '50', 'blank': 'True'})
        },
        u'chat.chatuser': {
            'Meta': {'object_name': 'ChatUser'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'last_visits': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['chat.LastVisit']", 'symmetrical': 'False'}),
            'user': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['auth.User']", 'unique': 'True'})
        },
        u'chat.comptoir': {
            'Meta': {'object_name': 'Comptoir'},
            'description': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '10', 'primary_key': 'True', 'db_index': 'True'}),
            'key_hash': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '512', 'null': 'True', 'blank': 'True'}),
            'last_message': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['chat.IndependantMessage']", 'null': 'True'}),
            'owner': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['auth.User']", 'null': 'True'}),
            'public': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'title_is_ciphered': ('django.db.models.fields.BooleanField', [], {'default': 'False'})
        },
        u'chat.independantmessage': {
            'Meta': {'object_name': 'IndependantMessage'},
            'content': ('django.db.models.fields.CharField', [], {'max_length': '2048'}),
            'date': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'edited': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'last_edit': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'null': 'True', 'blank': 'True'}),
            'me_message': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'owner': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['auth.User']"})
        },
        u'chat.lastvisit': {
            'Meta': {'object_name': 'LastVisit'},
            'comptoir': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['chat.Comptoir']"}),
            'date': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'})
        },
        u'chat.message': {
            'Meta': {'object_name': 'Message', '_ormbases': [u'chat.IndependantMessage']},
            'comptoir': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['chat.Comptoir']"}),
            u'independantmessage_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['chat.IndependantMessage']", 'unique': 'True', 'primary_key': 'True'})
        },
        u'contenttypes.contenttype': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        }
    }

    complete_apps = ['chat']