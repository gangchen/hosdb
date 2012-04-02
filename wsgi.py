import os
import sys

apache_configuration= os.path.dirname(__file__) 
project = os.path.dirname(apache_configuration) 
workspace = os.path.dirname(project) 
sys.path.append(workspace) 

sys.path.append('/home/gang/hosdb')
sys.path.append('/home/gang')

import django.core.handlers.wsgi
import site



os.environ['DJANGO_SETTINGS_MODULE'] = 'hosdb.settings'

application = django.core.handlers.wsgi.WSGIHandler()
