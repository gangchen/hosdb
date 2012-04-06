from fabric.api import run
from fabric.context_managers import cd
def update_hosdb():
    with cd('/var/www/hosdb/'):
        run('git pull')
        run('python manage.py syncdb')
        run('python manage.py collectstatic --noinput')
