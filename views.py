from django.http import HttpResponse
from django import template
from django.template.loader import get_template
from django.template import Template, Context

def index(request):
    template = get_template('index.html')
    html = template.render(Context());
    return HttpResponse(html)
