# Create your views here.
#from django.template import Context, loader
from ostbase.models import Gene, Mirna, Lncrna, Pathway
from django.shortcuts import render_to_response
from django.http import  HttpResponse
from django.template import *
from django.template.loader import get_template
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger

def genes(request):
    search = request.POST.get('search','')
    if search == "":
	search = request.GET.get('search','')
    fullGene = Gene.objects.all()
    paginator = Paginator(fullGene,50)
    p = request.GET.get('page','')
    try:
        items = paginator.page(p)
    except PageNotAnInteger:
        items = paginator.page(1)
    except EmptyPage:
        items = paginator.page(paginator.num_pages)
    return render_to_response('genes.html', {'fullGene': fullGene,'search': search,'items': items},context_instance=RequestContext(request))

def genesTable(request):
    fullGene = Gene.objects.order_by("chromosome")
    return render_to_response('genes.html', {'fullGene': fullGene},context_instance=RequestContext(request))

def selectedGene(request, geneSymbol):
    selectedGenes = Gene.objects.filter(officalSymbal = geneSymbol)
    template = get_template('gene.html')
    html = template.render(Context({'selectedGenes':selectedGenes}))
    return HttpResponse(html)

def mirna(request):
    template = get_template('mirnas.html')
    html = template.render(Context())
    return HttpResponse(html)

def selectedMirna(request, mirna):
    template = get_template('mirna.html')
    html = template.render(Context())
    return HttpResponse(html)

def lncrna(request):
    template = get_template('lncrnas.html')
    html = template.render(Context())
    return HttpResponse(html)

def selectedLncrna(request, lncrna):
    template = get_template('lncrna.html')
    html = template.render(Context())
    return HttpResponse(html)

def pathway(request):
    template = get_template('pathways.html')
    html = template.render(Context())
    return HttpResponse(html)

def selectedPathway(request, pathway):
    template = get_template('pathway.html')
    html = template.render(Context())
    return HttpResponse(html)

def xhr_test(request):
    if request.is_ajax():
        message = "Ajax"
    else:
        message = "Hello"
    return HttpResponse(message)
