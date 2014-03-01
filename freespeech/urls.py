from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

import chat

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'freespeech.views.home', name='home'),
    # url(r'^freespeech/', include('freespeech.foo.urls')),
    url("", include('django_socketio.urls')),

    url(r'^$', 'chat.views.index', name='home'),
    url(r'^check_hash', 'chat.views.check_hash', name='check_hash'),
    url(r'^send$', 'chat.views.send', name='send'),
    url(r'^about$', 'chat.views.about', name='about'),
    url(r'^update$', 'chat.views.update', name='update'),
    url(r'^login$', 'chat.views.auth', name='login'),
    url(r'^logout$', 'chat.views.sign_out', name='logout'),
    url(r'^register$', 'chat.views.register', name='register'),
    url(r'^create_comptoir$', 'chat.views.create_comptoir', name='create_comptoir'),
    url(r'^(?P<cid>[-A-Za-z0-9_]+)$', 'chat.views.join_comptoir', name="join_comptoir"),
    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
)
