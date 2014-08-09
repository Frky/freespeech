from django.conf.urls import patterns, include, url

from freespeech.settings import UNDER_WORK

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

import chat

if not UNDER_WORK:
    urlpatterns = patterns('',
        # Examples:
        # url(r'^$', 'freespeech.views.home', name='home'),
        # url(r'^freespeech/', include('freespeech.foo.urls')),
        url("", include('django_socketio.urls')),
    
        url(r'^$', 'chat.views.index', name='home'),
        url(r'^check_hash', 'chat.views.check_hash', name='check_hash'),
        url(r'^remove-msg', 'chat.views.remove_msg', name="remove_msg"),
        url(r'^about$', 'chat.views.about', name='about'),
        url(r'^previous_msg$', 'chat.views.load_previous_messages', name='previous_msg'),
        url(r'^login$', 'chat.views.auth', name='login'),
        url(r'^logout$', 'chat.views.sign_out', name='logout'),
        url(r'^register$', 'chat.views.register', name='register'),
        url(r'^report$', 'chat.views.report', name='report'),
        url(r'^create_comptoir$', 'chat.views.create_comptoir', name='create_comptoir'),
        url(r'^reporting_box$', 'chat.views.reporting_box', name='reporting_box'),
        url(r'^ajax-(?P<cid>[-A-Za-z0-9_]+)$', 'chat.views.ajax_comptoir', name="ajax_comptoir"),
        url(r'^cmptrinfo-(?P<cid>[-A-Za-z0-9_]+)$', 'chat.views.cmptr_info', name="cmptr_info"),
        url(r'^(?P<cid>[-A-Za-z0-9_]+)$', 'chat.views.join_comptoir', name="join_comptoir"),
        # Uncomment the admin/doc line below to enable admin documentation:
        # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),
    
        # Uncomment the next line to enable the admin:
        # url(r'^admin/', include(admin.site.urls)),
    )
else:
    urlpatterns = patterns('',
        url(r'^', 'chat.views.under_work', name='under_work'),
    )
