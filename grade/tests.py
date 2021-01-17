from django.test import TestCase
from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required

# Create your tests here.
@login_required()
def baseView(request):
    return render(request, 'grade/base.html')
