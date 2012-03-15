# Create your views here.
#from django.template import Context, loader
from ostbase.models import Gene
from django.shortcuts import render_to_response
from django.http import  HttpResponse
from django.template import *
from django.template.loader import get_template

def genes(request):
    latest_account_list = Gene.objects.all()[:90]
    return render_to_response('genes.html', {'latest_account_list': latest_account_list})

def selectedGene(request, geneSymbol):
    selectedGenes = Gene.objects.filter(officalSymbal = geneSymbol)
    template = get_template('gene.html')
    html = template.render(Context({'selectedGenes':selectedGenes}))
    return HttpResponse(html)
