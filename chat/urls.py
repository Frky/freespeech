from django.conf import settings
from django.conf.urls import include, url

if settings.UNDER_WORK:
    urlpatterns = [
                        url(r'^', 'chat.views.under_work', name='under_work'),
                    ]
else:
    urlpatterns = [
                        url("", include('django_socketio.urls')),
    
                        url(r'^$', 'chat.views.index', name='home'),
                        url(r'^welcome$', 'chat.views.welcome', name='welcome'),
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

                        url(r'^ws_msg$', 'chat.views.ws_msg', name='ws_msg'),
                        url(r'^ws_wizz$', 'chat.views.ws_wizz', name='ws_wizz'),
                        url(r'^ws_edit$', 'chat.views.ws_edit', name='ws_edit'),
                        url(r'^ws_identicate$', 'chat.views.ws_identicate', name='ws_identicate'),

                        url(r'^ajax-(?P<cid>[-A-Za-z0-9_]+)$', 'chat.views.ajax_comptoir', name="ajax_comptoir"),
                        url(r'^stats-(?P<cid>[-A-Za-z0-9_]+)$', 'chat.views.cmptr_stats', name="cmptr_stats"),
                        url(r'^cmptrinfo-(?P<cid>[-A-Za-z0-9_]+)$', 'chat.views.cmptr_info', name="cmptr_info"),
                        url(r'^(?P<cid>[-A-Za-z0-9_]+)$', 'chat.views.join_comptoir', name="join_comptoir"),

                        # Account management
                        url(r'^password/change/$',
                            'django.contrib.auth.views.password_change',
                            {'template_name': 'chat/password_change.html', 'post_change_redirect': 'home'},
                            name="password_change",
                            ),
                    ]
