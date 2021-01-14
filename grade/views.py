from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from .models import *
from account.models import User

@login_required()
def home(request):
    papers = Paper.objects.filter(author=request.user)
    contents = {
        'papers' : papers,
    }
    return render(request, 'grade/home.html', contents)

@login_required()
def capture(request):
    return render(request, 'grade/capture.html')

@login_required()
def comfirm(request):
    return render(request, 'grade/comfirm.html')

@login_required()
def analyzing(request):
    return render(request, 'grade/analyzing.html')

@login_required()
def score(request, paper_id):
    paper = Paper.objects.filter(id=paper_id)
    paper = paper[0] if len(paper)!=0 else None
    scores = Score.objects.filter(paper=paper)
    contents = {
        'scores' : scores,
    }
    return render(request, 'grade/score.html', contents)

@login_required()
def scoredetail(request, score_id):
    score = Score.objects.filter(id=score_id)
    score = score[0] if len(score)!=0 else None
    scoredetails = ScoreDetail.objects.filter(score=score)
    contents = {
        'score' : score,
        'scoredetails' : scoredetails,
    }
    return render(request, 'grade/scoredetail.html', contents)
