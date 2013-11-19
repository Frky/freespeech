from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

import chat

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'freespeech.views.home', name='home'),
    # url(r'^freespeech/', include('freespeech.foo.urls')),

    url(r'^$', 'chat.views.index', name='home'),
    url(r'^send$', 'chat.views.send', name='send'),
    url(r'^update$', 'chat.views.update', name='update'),
    url(r'^login$', 'chat.views.auth', name='login'),
    url(r'^logout$', 'chat.views.sign_out', name='logout'),
    url(r'^register$', 'chat.views.register', name='register'),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
)
