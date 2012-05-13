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

class Rna(models.Model):
    regulation = models.CharField(max_length = 10)
    rnaType = models.CharField(max_length = 50)
    source = models.CharField(max_length = 50)
    seqname = models.CharField(max_length = 100)
    geneSymbol = models.CharField(max_length = 50, null = True, blank = True)
    chromosome = models.CharField(max_length = 20)
    strand = models.CharField(max_length = 20)
    txStart = models.BigIntegerField()
    txEnd = models.BigIntegerField()

    class Meta:
        abstract = True

class Lncrna(Rna):
    relationship = models.CharField(max_length = 50)
    associatedGeneAcc = models.CharField(max_length = 100, blank = True, null = True)
    associatedGeneName = models.CharField(max_length = 100, blank = True, null = True)
    associatedProteinName = models.CharField(max_length = 100, blank = True, null = True)
    associatedGeneStrand = models.CharField(max_length = 20, blank = True, null = True)
    associatedGeneStart = models.CharField(max_length = 20, null = True, blank = True)
    associatedGeneEnd = models.CharField(max_length = 20, null = True, blank = True)
    
class Mirna(models.Model):
    rnaName = models.CharField(max_length = 30)
    supportType = models.CharField(max_length = 30)
    organism = models.CharField(max_length = 50)
    hgncId = models.CharField(max_length = 30, blank = True, null = True)
    gene = models.CharField(max_length = 50)
    isoform = models.CharField(max_length = 50, blank = True, null = True)
    evidence = models.CharField(max_length = 100, blank = True, null = True)
    chromosome = models.CharField(max_length = 30, blank = True, null = True)
    startPos = models.CharField(max_length = 30, blank = True, null = True)
    endPos = models.CharField(max_length = 30, blank = True, null = True)
    

class Pathway(models.Model):
    pathwayId = models.BigIntegerField(unique = True)
