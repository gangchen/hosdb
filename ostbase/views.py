# Create your views here.
#from django.template import Context, loader
from ostbase.models import Gene
from django.shortcuts import render_to_response
from django.http import  HttpResponse
from django.template import RequestContext

def genes(request):
    latest_account_list = Gene.objects.all()[:90]
    return render_to_response('genes.html', {'latest_account_list': latest_account_list})
