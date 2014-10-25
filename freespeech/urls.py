from django.conf.urls import patterns, include, url

from freespeech.settings import UNDER_WORK

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

# handler404 = 'chat.views.error404'

if not UNDER_WORK:
    urlpatterns = patterns('',
        url("", include('django_socketio.urls')),
    
        url(r'^$', 'chat.views.index', name='home'),
        url(r'^404$', 'chat.views.error404', name='error404'),
        url(r'^505$', 'chat.views.error505', name='error505'),
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

        # Account management
        url(r'^password/change/$',
            'django.contrib.auth.views.password_change',
            {'template_name': 'chat/password_change.html', 'post_change_redirect': 'home'},
            name="password_change",
            ),

    )
else:
    urlpatterns = patterns('',
                           url(r'^', 'chat.views.under_work', name='under_work'),
                           )
