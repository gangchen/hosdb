# Create your views here.
#from django.template import Context, loader
from ostbase.models import Gene
from django.shortcuts import render_to_response
from django.http import  HttpResponse
from django.template import *
from django.template.loader import get_template
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger

def genes(request):
    search = request.POST.get('search','')
    if search == "":
	search = request.GET.get('search','')
    fullGene = Gene.objects.filter(officalSymbal__contains=search)
    paginator = Paginator(fullGene,5)
    p = request.GET.get('page','')
    try:
        items = paginator.page(p)
    except PageNotAnInteger:
        items = paginator.page(1)
    except EmptyPage:
        items = paginator.page(paginator.num_pages)
    return render_to_response('GeneList.html', {'fullGene': fullGene,'search': search,'items': items},context_instance=RequestContext(request))

def selectedGene(request, geneSymbol):
    selectedGenes = Gene.objects.filter(officalSymbal = geneSymbol)
    template = get_template('gene.html')
    html = template.render(Context({'selectedGenes':selectedGenes}))
    return HttpResponse(html)
