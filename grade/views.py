from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse, QueryDict
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, authenticate
import cv2
import io
import numpy as np
from PIL import Image as PILImage
from exlibs.ai_review_char.execute import execute as kanji_analyze
from .models import *
from .forms import UserCreateForm as SignUpForm
from account.models import User

def signup(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            form.save()
            #フォームから'username'を読み取る
            username = form.cleaned_data.get('username')
            #フォームから'password1'を読み取る
            password = form.cleaned_data.get('password1')
            user = authenticate(username=username, password=password)
            login(request, user)
            return redirect('/')
    else:
        form = SignUpForm()

    context = {'form':form}
    return render(request, 'registration/signup.html', context)

@login_required()
def home(request):
    papers = Paper.objects.filter(author=request.user).order_by('pub_date').reverse()
    for p in papers:
        p.kanjis = p.kanjilist()
        p.average = p.average()
    scores = Score.get_top_n(request.user, 10)
    contents = {
        'scores' : scores,
        'papers' : papers,
    }
    return render(request, 'grade/home.html', contents)

@login_required
def history(request):
    papers = Paper.objects.filter(author=request.user).order_by('pub_date').reverse()
    for p in papers:
        p.kanjis = p.kanjilist()
        p.average = p.average()
    contents = {
        'papers' : papers,
    }
    return render(request, 'grade/history.html', contents)

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
    sd_phase1 = ScoreDetail.objects.filter(score=score, phase=1)
    sd_phase2 = ScoreDetail.objects.filter(score=score, phase=2)
    sd_phase3 = ScoreDetail.objects.filter(score=score, phase=3)
    sd_phase4 = ScoreDetail.objects.filter(score=score, phase=4)
    sd_phase1 = sd_phase1[0] if len(sd_phase1) != 0 else None
    sd_phase2 = sd_phase2[0] if len(sd_phase2) != 0 else None
    sd_phase3 = sd_phase3[0] if len(sd_phase3) != 0 else None
    sd_phase4 = sd_phase4[0] if len(sd_phase4) != 0 else None
    ad_phase2 = Advice.objects.filter(scoredetail=sd_phase2)
    ad_phase3 = Advice.objects.filter(scoredetail=sd_phase3)
    contents = {
        'score' : score,
        'phase1' : sd_phase1,
        'phase2' : sd_phase2,
        'phase3' : sd_phase3,
        'phase4' : sd_phase4,
        'advice2' : ad_phase2,
        'advice3' : ad_phase3,
    }
    return render(request, 'grade/scoredetail.html', contents)

# image analyzing
@login_required()
def analyzing(request):
    if request.method != 'POST':
        return HttpResponse("You should access here using POST method.")

    print("start analyzing")
    #print(request.body)
    print(request.POST)
    print(request.FILES)
    #print(request.upload_handlers)
    #print(request.__dict__)
    #print(request.files)

    #image = request.FILES.get('data');
    #dic = QueryDict(request.body, encoding='utf-8')
    #image = dic.get('data')
    image = request.FILES.get('pic')
    rot = int(request.POST.get('rotate'))
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

    img = cv2.imdecode(np.fromstring(image.read(), np.uint8), cv2.IMREAD_COLOR)
    print(img.shape[:3])
    if len(img) == 0:
        return JsonResponse(
            data={
            'isSuccess' : False,
            'message' : "画像が認識できませんでした．",
            }
        )

    #rotate image to correct direction
    rot_set = [
        None,
        cv2.ROTATE_90_CLOCKWISE,
        cv2.ROTATE_180,
        cv2.ROTATE_90_COUNTERCLOCKWISE,
    ]
    if rot_set[rot] is not None:
        img = cv2.rotate(img, rot_set[rot])
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
    paper = _register_scores(result, request.user)

    print(paper.id)

    return JsonResponse(
        data={
            'isSuccess' : True,
            'paper_id' : paper.id
        }
    )

@login_required
def download_image(request, image_id):
    image = Image.objects.all()
    #print(image)
    image = image[0] if len(image)!=0 else None
    response = HttpResponse()
    #print(image)
    if image != None:
        response.content = image.body

    return response

### local methods
def _register_scores(results, user):
    paper = Paper.objects.create(author=user)

    for results_row in results:
        for result in results_row:
            _register_score(result, paper, user)

    return paper

def _register_score(result, paper, user):
    #create Score
    bimg_tar = cv2imgtob(result.get_img())
    image_tar = Image.objects.create(body=bimg_tar, author=user)
    score = Score.objects.create(
        score = result.get_total_score_point(),
        kanji = result.get_kanji(),
        img = image_tar,
        paper = paper,
        author = user
    )

    #create phase1
    phase1_result = result.get_result_phase1()
    phase1_bimg = cv2imgtob(result.get_img_phase1())
    phase1_img = Image.objects.create(body=phase1_bimg, author=user)
    phase1 = ScoreDetail.objects.create(
        phase = 1,
        scoredetail = 50 if phase1_result else 0,
        img = phase1_img,
        score = score,
        author = user
    )

    #create phase4
    phase4 = ScoreDetail.objects.create(
        phase = 4,
        scoredetail = result.get_score_phase4(),
        img = None,
        score = score,
        author = user
    )

    # not create phase2 or later if phase1 is false.
    if not phase1_result:
        return

    #create phase2
    phase2_bimg = cv2imgtob(result.get_img_phase2())
    phase2_img = Image.objects.create(body=phase2_bimg, author=user)
    phase2 = ScoreDetail.objects.create(
        phase = 2,
        scoredetail = result.get_score_phase2(),
        img = phase2_img,
        score = score,
        author = user
    )

    #create phase2 messages
    for gmsg in result.get_items_good_phase2():
        Advice.objects.create(
            message = gmsg,
            label = 2,
            index = None,
            scoredetail = phase2,
            author = user
        )
    for bmsg in result.get_items_tips_phase2():
        Advice.objects.create(
            message = bmsg,
            label = 0,
            index = None,
            scoredetail = phase2,
            author = user
        )

    #create phase3
    phase3_bimg = cv2imgtob(result.get_img_phase3())
    phase3_img = Image.objects.create(body=phase3_bimg, author=user)
    phase3 = ScoreDetail.objects.create(
        phase = 3,
        scoredetail = result.get_score_phase3(),
        img = phase3_img,
        score = score,
        author = user
    )

    #create phase3 messages
    for item in result.get_items_phase3():
        Advice.objects.create(
            message = item[1],
            label = item[2],
            index = item[0],
            scoredetail = phase3,
            author = user
        )

def cv2imgtob(cv2img):
    cv2img = cv2.rotate(cv2img, cv2.ROTATE_90_CLOCKWISE)
    cvimg = cv2.cvtColor(cv2img.astype(np.float32), cv2.COLOR_BGR2RGB)
    cvimg = cvimg.astype(np.uint8)
    image = PILImage.fromarray(cvimg)
    png = io.BytesIO()
    image.save(png, format='png')
    b = png.getvalue()
    return b
