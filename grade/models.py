from django.conf import settings
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model

class Image(models.Model):
    body = models.BinaryField()
    author = models.ForeignKey(
        get_user_model(),
        on_delete=models.CASCADE,
    )
    #Image
    #image hash

# Create your models here.
class Paper(models.Model):
    pub_date = models.DateTimeField(_('pub date'), default=timezone.now)
    author = models.ForeignKey(
        get_user_model(),
        on_delete=models.CASCADE,
    )

    def average(self):
        scores = Score.objects.filter(paper=self)
        ave = 0;
        for s in scores:
            ave += s.score
        return ave / len(scores)

    def kanjilist(self):
        scores = Score.objects.filter(paper=self)
        list = []
        for s in scores:
            if not s.kanji in list:
                list.append(s.kanji)
        return list

class Score(models.Model):
    score = models.FloatField()
    score_p1 = models.FloatField(null=True)
    score_p2 = models.FloatField(null=True)
    score_p3 = models.FloatField(null=True)
    kanji = models.CharField(max_length=1)
    img = models.ForeignKey(
        Image, on_delete=models.SET_NULL,
        null=True,
    )
    paper = models.ForeignKey(
        Paper, on_delete=models.CASCADE,
    )
    author = models.ForeignKey(
        get_user_model(),
        on_delete=models.CASCADE,
    )

    @classmethod
    def get_top_n(cls, user, n):
        scores = cls.objects.filter(author=user).order_by('score').reverse()[:n]
        return scores

class ScoreDetail(models.Model):
    phase = models.IntegerField()
    result = models.BooleanField()
    message = models.TextField()
    img = models.ForeignKey(
        Image, on_delete=models.SET_NULL,
        null=True,
    )
    #scoredetail = models.FloatField()
    score = models.ForeignKey(
        Score, on_delete=models.CASCADE,
    )
    author = models.ForeignKey(
        get_user_model(),
        on_delete=models.CASCADE,
    )
