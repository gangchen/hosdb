# Create your views here.
#from django.template import Context, loader
from ostbase.models import Gene
from django.shortcuts import render_to_response
from django.http import  HttpResponse
from django.template import *
from django.template.loader import get_template

#def genes(request):
    #fullGene = Gene.objects.all()[:90]
   # search = request.POST.get('search',None)
   # return render_to_response('GeneList.html')
    #return render_to_response('GeneList.html', {'fullGene': fullGene,'search': search},context_instance=RequestContext(request))

def selectedGene(request, geneSymbol):
    selectedGenes = Gene.objects.filter(officalSymbal = geneSymbol)
    template = get_template('gene.html')
    html = template.render(Context({'selectedGenes':selectedGenes}))
    return HttpResponse(html)
