from django.conf.urls import include
from django.urls import path
from django.contrib import admin
from . import views, tests

urlpatterns = [
    path('', views.home, name='home'),
    path('history/', views.history, name='history'),
    path('capture/', views.capture, name='capture'),
    #path('comfirm/', views.comfirm, name='comfirm'),
    path('score/<int:paper_id>/', views.score, name='score'),
    path('scoredetail/<int:score_id>/', views.scoredetail, name='scoredetail'),
    path('analyzing/', views.analyzing, name='analyzing'),
    path('kanji_image/<int:image_id>/', views.download_image, name='kanji_image'),

    path('signup/', views.signup, name='signup'),

    path('test_base', tests.baseView, name='test_base'),
]
