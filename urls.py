#from django.conf.urls.defaults import patterns, include, url
from django.conf.urls.defaults import *
from hosdb.views import *
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'mysite.views.home', name='home'),
    # url(r'^mysite/', include('mysite.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
    # url(r'^ostbase/', include('ostbase.url')),
    url(r'^GeneList/', include('ostbase.url')),
    #url(r'^GeneList/$', genes),
    url(r'^query/$', query),
    url(r'^$', home),
)

urlpatterns += staticfiles_urlpatterns()
