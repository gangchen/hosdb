from django.http import HttpResponse
from django import template
from django.template.loader import get_template
from django.template import Template, Context
from django.shortcuts import render_to_response

def home(request):
    template = get_template('home.html')
    html = template.render(Context());
    return HttpResponse(html)

def query(request):
    template = get_template('Query.html')
    html = template.render(Context());
    return HttpResponse(html)

def about(request):
    template = get_template('about.html')
    html = template.render(Context());
    return HttpResponse(html)
