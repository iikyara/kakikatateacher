from django.conf.urls import include
from django.urls import path
from django.contrib import admin
from . import views, tests

urlpatterns = [
    #path('admin/', admin.site.urls),
    path('', views.home, name='home'),
    path('capture/', views.capture, name='capture'),
    #path('comfirm/', views.comfirm, name='comfirm'),
    path('score/<int:paper_id>/', views.score, name='score'),
    path('scoredetail/<int:score_id>/', views.scoredetail, name='scoredetail'),
    path('analyzing/', views.analyzing, name='analyzing'),
    path('kanji_image/<int:image_id>/', views.download_image, name='kanji_image'),
    path('test_base', tests.baseView, name='test_base'),
    #path('home', views.home, name='home'),
]
