from django.conf import settings
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model

class Image(models.Model):
    pass
    #Image
    #image hash

# Create your models here.
class Paper(models.Model):
    pub_date = models.DateTimeField(_('pub date'), default=timezone.now)
    author = models.ForeignKey(
        get_user_model(),
        on_delete=models.CASCADE,
    )

class Score(models.Model):
    score = models.FloatField()
    img_sq = models.ForeignKey(
        Image, on_delete=models.SET_NULL,
        null=True, related_name='img_sq',
    )
    img_exp = models.ForeignKey(
        Image, on_delete=models.SET_NULL,
        null=True, related_name='img_exp',
    )
    paper = models.ForeignKey(
        Paper, on_delete=models.CASCADE,
    )

class ScoreDetail(models.Model):
    label = models.IntegerField(default=0)
    message = models.TextField()
    #centroid = models.JSONField()
    #contour = models.JSONField()
    scoredetail = models.FloatField()
    score = models.ForeignKey(
        Score, on_delete=models.CASCADE,
    )
