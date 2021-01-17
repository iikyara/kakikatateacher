from django.shortcuts import render
from django.http import HttpResponse, JsonResponse, QueryDict
from django.contrib.auth.decorators import login_required
import cv2
import io
import numpy as np
from PIL import Image as PILImage
from exlibs.ai_review_char.execute import execute_debug as kanji_analyze
from .models import *
from account.models import User

@login_required()
def home(request):
    papers = Paper.objects.filter(author=request.user)
    for p in papers:
        p.kanjis = p.kanjilist()
    scores = Score.get_top_n(request.user, 10)
    contents = {
        'scores' : scores,
        'papers' : papers,
    }
    return render(request, 'grade/home.html', contents)

@login_required()
def capture(request):
    return render(request, 'grade/capture.html')

# @login_required()
# def comfirm(request):
#     return render(request, 'grade/comfirm.html')

@login_required()
def score(request, paper_id):
    paper = Paper.objects.filter(id=paper_id, author=request.user)
    paper = paper[0] if len(paper)!=0 else None
    scores = Score.objects.filter(paper=paper)
    contents = {
        'paper' : paper,
        'average' : paper.average(),
        'scores' : scores,
    }
    return render(request, 'grade/score.html', contents)

@login_required()
def scoredetail(request, score_id):
    score = Score.objects.filter(id=score_id, author=request.user)
    score = score[0] if len(score)!=0 else None
    scoredetails = ScoreDetail.objects.filter(score=score)
    sd_phase1 = [ x for x in scoredetails if x.phase == 1]
    sd_phase2 = [ x for x in scoredetails if x.phase == 2]
    sd_phase3 = [ x for x in scoredetails if x.phase == 3]
    contents = {
        'score' : score,
        'phase1' : sd_phase1,
        'phase2' : sd_phase2,
        'phase3' : sd_phase3,
    }
    return render(request, 'grade/scoredetail.html', contents)

# image analyzing
@login_required()
def analyzing(request):
    if request.method != 'POST':
        return HttpResponse("You should access here using POST method.")

    print("start analyzing")
    #print(request.body)
    #print(request.POST)
    print(request.FILES)
    #print(request.upload_handlers)
    #print(request.__dict__)
    #print(request.files)

    #image = request.FILES.get('data');
    #dic = QueryDict(request.body, encoding='utf-8')
    #image = dic.get('data')
    image = request.FILES.get('pic')
    #img = cv2.imread(image)
    print(image.name)
    print(image.size)

    if image == None:
        return JsonResponse(
            data={
            'isSuccess' : False,
            'message' : "画像が送信されていません．",
            }
        )

    img = cv2.imdecode(np.fromstring(image.read(), np.uint8), cv2.IMREAD_UNCHANGED)
    print(img.shape[:3])
    if len(img) == 0:
        return JsonResponse(
            data={
            'isSuccess' : False,
            'message' : "画像が認識できませんでした．",
            }
        )

    #test analyzing
    img = cv2.imread('./grade/static/grade/image/work6.png')
    print(img.shape[:3])
    result = kanji_analyze(img)
    print(result)

    if result[0] == False:
        return JsonResponse(
            data={
            'isSuccess' : False,
            'message' : "解析に失敗しました",
            }
        )

    #save to database
    #_register_scores(result, request.user)

    return JsonResponse(
        data={
            'isSuccess' : True,
            'paper_id' : imageField.id
        }
    )

@login_required
def download_image(request, image_id):
    image = Image.objects.all()
    print(image)
    image = image[0] if len(image)!=0 else None
    response = HttpResponse()
    print(image)
    if image != None:
        response.content = image.body

    return response

### local methods
def _register_scores(results, user):
    paper = Paper.objects.create()

    for results_row in results:
        for result in results_row:
            _register_score(result, paper, user)

def _register_score(result, paper, user):
    bimg_tar = cv2imgtob(result.get_img())
    bimg_p1 = cv2imgtob(result.get_img_phase1())
    bimg_p2 = cv2imgtob(result.get_img_phase2())
    bimg_p3 = cv2imgtob(result.get_img_phase3())

    #create images
    image_tar = Image.objects.create(body=bimg_tar)
    image_p1 = Image.objects.create(body=bimg_p1)
    image_p2 = Image.objects.create(body=bimg_p2)
    image_p3 = Image.objects.create(body=bimg_p3)

    #create score
    score = Score.objects.create(
        score = result.get_all_score_point,
        score_p1 = 50 if result.get_result_phase1() else 0,
        score_p2 = result.get_result_phase2(),
        score_p3 = result.get_result_phase3(),
        kanji = result.get_kanji(),
        img = image_tar,
        paper = paper,
        author = user
    )

    #create scoredetail
    ScoreDetail.objects.create(
        phase = 1,
        result = result.get_result_phase1(),
        message = result.get_message_phase1(),
        img = image_p1,
        score = score,
        author = user
    )
    ScoreDetail.objects.create(
        phase = 2,
        result = result.get_result_phase2(),
        message = result.get_message_phase2(),
        img = image_p2,
        score = score,
        author = user
    )
    for item in result.get_items_phase3():
        ScoreDetail.objects.create(
            phase = 3,
            result = item[2],
            message = item[1],
            img = image_p3,
            score = score,
            author = user
        )

def cv2imgtob(cv2img):
    cvimg = cv2.cvtColor(cv2img, cv2.COLOR_BGR2RGB)
    image = PILImage.fromarray(cvimg)
    png = io.BytesIO()
    image.save(png, format='png')
    b = png.getvalue()
    return b
