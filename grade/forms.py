from account.models import User
from django.contrib.auth import forms
from django.contrib.auth.forms import UserCreationForm

class UserCreateForm(UserCreationForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        #htmlの表示を変更可能にします
        self.fields['username'].widget.attrs['class'] = 'form-control'
        self.fields['password1'].widget.attrs['class'] = 'form-control'
        self.fields['password2'].widget.attrs['class'] = 'form-control'
        self.fields['nickname'].widget.attrs['class'] = 'form-control'


    class Meta:
       model = User
       fields = ("username", "password1", "password2", "nickname",)

# class SignUpForm(forms.Form):
#     username = forms.CharField(widget=forms.TextInput)
#     enter_password = forms.CharField(widget=forms.PasswordInput)
#     retype_password = forms.CharField(widget=forms.PasswordInput)
#     nickname = form.CharField(widget=forms.TextInput)
#
#     def clean_username(self):
#         username = self.cleaned_data.get('username')
#         if User.objects.filter(username=username).exists():
#             raise forms.ValidationError('すでに とうろくされている ユーザーめいです。')
#         return username
#
#     def clean_enter_password(self):
#         password = self.cleaned_data.get('enter_password')
#         if len(password) < 5:
#             raise forms.ValidationError('パスワードは 5もじいじょうで せっていしてください。')
#         return password
#
#     def clean_nickname(self):
#         nickname = self.cleaned_data.get('nickname')
#         if len(nickname) == 0:
#             nickname = None
#         return nickname
#
#     def clean(self):
#         super(SignUpForm, self).clean()
#         password = self.cleaned_data.get('enter_password')
#         retyped = self.cleaned_data.get('retype_password')
#         if password and retyped and (password != retyped):
#             self.add_error('retype_password', '2かいめの パスワードが ちがいます。')
#
#     def save(self):
#         username = self.cleaned_data.get('username')
#         password = self.cleaned_data.get('enter_password')
#         nickname = self.cleaned_data.get('nickname')
#         new_user = User.objects.create_user(username = username, nickname=nickname)
#         new_user.set_password(password)
#         new_user.save()
