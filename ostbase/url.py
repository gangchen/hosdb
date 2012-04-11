from django.conf.urls.defaults import *

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('ostbase.views',
    # Examples:
    # url(r'^$', 'mysite.views.home', name='home'),
    # url(r'^mysite/', include('mysite.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^genes/$', 'genes'),
    url('^genes/(.+)', 'selectedGene'),
    url(r'^mirna/$', 'mirna'),
    url(r'^mirna/(.+)', 'selectedMirna'),
    url(r'^lncrna/$', 'lncrna'),
    url(r'^lncrna/(.+)', 'selectedLncrna'),
    url(r'^pathway/$', 'pathway'),
    url(r'^pathway/(.+)', 'selectedPathway'),
    url(r'^test/$', 'genesTable'),
    #url(r'^\d+$', 'genes'),
    #url(r'^(.+)$', 'selectedGene'),
    #url(r'^(?P<poll_id>\d+)/$', 'detail'),
    #url(r'^(?P<poll_id>\d+)/results/$', 'results'),
    #url(r'^(?P<poll_id>\d+)/vote/$', 'vote'),
    #url(r'^(?P<poll_id>\d+)/login/$', 'login'),
    #url(r'^polls/$', 'polls.views.index'),
    #url(r'^polls/(?P<poll_id>\d+)/$', 'polls.views.detail'),
    #url(r'^polls/(?P<poll_id>\d+)/results/$', 'polls.views.results'),
    #url(r'^polls/(?P<poll_id>\d+)/vote/$', 'polls.views.vote'),
    #url(r'^admin/', include(admin.site.urls)),
)
