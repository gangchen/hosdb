from django.http import HttpResponse
from django import template
from django.template.loader import get_template
from django.template import Template, Context
from django.shortcuts import render_to_response

def home(request):
    template = get_template('home.html')
    html = template.render(Context());
    return HttpResponse(html)

def genes(request):
    template = get_template('GeneList.html')
    html = template.render(Context());
    return HttpResponse(html)

def query(request):
    template = get_template('Query.html')
    html = template.render(Context());
    return HttpResponse(html)


    #fullGene = Gene.objects.all()[:90]
    #search = request.POST.get('search',None)
    #return render_to_response('GeneList.html')
