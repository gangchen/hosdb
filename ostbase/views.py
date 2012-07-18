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
    paginator = Paginator(fullGene,10)
    p = request.GET.get('page','')
    try:
        items = paginator.page(p)
    except PageNotAnInteger:
        items = paginator.page(1)
    except EmptyPage:
        items = paginator.page(paginator.num_pages)
    return render_to_response('genes.html', {'fullGene': fullGene,'search': search,'items': items},context_instance=RequestContext(request))

def selectedGene(request, geneSymbol):
    selectedGenes = Gene.objects.filter(officalSymbal = geneSymbol)
    template = get_template('gene.html')
    html = template.render(Context({'selectedGenes':selectedGenes}))
    return HttpResponse(html)

def mirna(request):
    search = request.POST.get('search','')
    if search == "":
		search = request.GET.get('search','')
    fullGene = Mirna.objects.all()
    paginator = Paginator(fullGene,10)
    p = request.GET.get('page','')
    try:
        items = paginator.page(p)
    except PageNotAnInteger:
        items = paginator.page(1)
    except EmptyPage:
        items = paginator.page(paginator.num_pages)
    return render_to_response('mirnas.html', {'fullGene': fullGene,'search': search,'items': items},context_instance=RequestContext(request))

def selectedMirna(request, mirna):
    template = get_template('mirna.html')
    html = template.render(Context())
    return HttpResponse(html)

def lncrna(request):
    search = request.POST.get('search','')
    if search == "":
	search = request.GET.get('search','')
    fullGene = Lncrna.objects.all()
    paginator = Paginator(fullGene,10)
    p = request.GET.get('page','')
    try:
        items = paginator.page(p)
    except PageNotAnInteger:
        items = paginator.page(1)
    except EmptyPage:
        items = paginator.page(paginator.num_pages)
    return render_to_response('lncrnas.html', {'fullGene': fullGene,'search': search,'items': items},context_instance=RequestContext(request))

def selectedLncrna(request, lncrna):
    selectedGenes = Lncrna.objects.filter(seqname = lncrna)
    template = get_template('gene.html')
    html = template.render(Context({'selectedGenes':selectedGenes}))
    return HttpResponse(html)
    #template = get_template('lncrna.html')
    #html = template.render(Context())
    #return HttpResponse(html)

def pathway(request):
    template = get_template('pathways.html')
    html = template.render(Context())
    return HttpResponse(html)

def selectedPathway(request, pathway):
    template = get_template('pathway.html')
    html = template.render(Context())
    return HttpResponse(html)
