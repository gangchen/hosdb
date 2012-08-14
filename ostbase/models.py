from django.db import models

# Create your models here.
class Gene(models.Model):
    geneId = models.BigIntegerField(unique = True)
    geneSym = models.CharField(max_length = 100)
    ncbiacc = models.CharField(max_length=20)
    organism = models.CharField(max_length = 100,default='Homo sapiens',editable = False)
    chromosome = models.CharField(max_length = 50)
    start = models.CharField(max_length = 20)
    end = models.CharField(max_length = 20)
    strand = models.CharField(max_length = 1)
    evidence = models.CharField(max_length = 2000)

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
    pathwayId = models.CharField(unique = True, max_length=20)
    pathwayTerm = models.CharField(max_length = 100)
    genes = models.CharField(max_length = 1000)

