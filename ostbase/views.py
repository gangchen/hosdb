# Create your views here.
#from django.template import Context, loader
from ostbase.models import Gene
from django.shortcuts import render_to_response, get_object_or_404
from django.http import HttpResponseRedirect, HttpResponse
from django.http import Http404
from django.core.urlresolvers import reverse
from django.template import RequestContext

def index(request):
    latest_account_list = Gene.objects.all()[:90]
    return render_to_response('ostbase/index.html', {'latest_account_list': latest_account_list})
