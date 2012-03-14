from django.db import models

# Create your models here.
class Gene(models.Model):
    geneId = models.BigIntegerField(unique = True)
    officalSymbal = models.CharField(max_length = 100)
    officalFullName = models.CharField(max_length = 300)
    otherAliases = models.CharField(max_length = 300,blank = True)
    geneType = models.CharField(max_length = 100)
    organism = models.CharField(max_length = 100,default='Homo sapiens',editable = False)
    chromosome = models.CharField(max_length = 50)
    location = models.CharField(max_length = 50)
    summary = models.CharField(max_length = 3000,blank = True, default='')
