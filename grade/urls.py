from django.conf.urls import include
from django.urls import path
from django.contrib import admin
from . import views

urlpatterns = [
    #path('admin/', admin.site.urls),
    path('', views.home, name='home'),
    path('capture/', views.capture, name='capture'),
    path('comfirm/', views.comfirm, name='comfirm'),
    path('analyzing/', views.analyzing, name='analyzing'),
    path('score/<int:paper_id>/', views.score, name='score'),
    path('scoredetail/<int:score_id>/', views.scoredetail, name='scoredetail'),
    #path('home', views.home, name='home'),
]
