# HOSDB Project

Human OsteoSarcoma DataBase (HOSDB) is a Django-based bioinformatics database website for human osteosarcoma. Related genes, miRNAs, proteins and interactions are collected and provided in this database.

## Developers
* Weijie Chen
* Yiming He
* Qi Li
* Gang Chen

## Deployment
First, a database should be created for HOSDB. Related configuration in settings.py should be modified accordingly.

Then, following commands should be executed:
    python manage.py syncdb
	python manage.py collectstatic

## References
