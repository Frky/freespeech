from django.contrib.auth.forms import UserCreationForm
from django import forms
from django.db import models
from django.core.validators import MinLengthValidator, MaxLengthValidator

from chat.models import Comptoir, BugReport


class ComptoirForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        self.base_fields['title'].label = "Name"
        self.base_fields['title'].widget = forms.TextInput(attrs={'placeholder': "Field requested", 'class': "input form-control"})
        self.base_fields['description'].label = "Description"
        self.base_fields['description'].widget = forms.TextInput(attrs={'placeholder': "", 'class': "input form-control"})
        self.base_fields['public'].label = "Public ?"
        self.base_fields['key_hash'].validators = [v for v in self.base_fields['key_hash'].validators if not isinstance(v, MinLengthValidator)]
        self.base_fields['key_hash'].validators.append(MinLengthValidator(128))
        self.base_fields['key_hash'].label="SHA3 of the key"
        self.base_fields['key_hash'].widget = forms.TextInput(attrs={'id': "comptoir-key-hash", 'class': "input form-control", 'placeholder': "Field requested (you may generate a key)"})
        super(ComptoirForm, self).__init__(*args, **kwargs)

    class Meta:
        model = Comptoir
        fields = ['title', 'description', 'public', 'key_hash']

class RegisterForm(UserCreationForm):

    def __init__(self, *args, **kwargs):
        # self.base_fields['username'].label = ""

        self.base_fields['username'].widget = forms.TextInput(attrs={'placeholder': "username", 'class': "form-control"})
        self.base_fields['password1'].widget = forms.TextInput(attrs={'type': 'password', 'placeholder': "password", 'class': "form-control"})
        self.base_fields['password2'].widget = forms.TextInput(attrs={'type': 'password', 'placeholder': "password (again)", 'class': "form-control"})

        super(RegisterForm, self).__init__(*args, **kwargs)


class BugReportForm(forms.ModelForm):

        def __init__(self, *args, **kwargs):
            self.base_fields['url'].label = "Page(s) concerned by the bug/suggestion"
            self.base_fields['url'].widget = forms.TextInput(attrs={'class': "input form-control"})
            self.base_fields['description'].label = "Description of the bug/suggestion"
            self.base_fields['description'].widget = forms.Textarea(attrs={'placeholder': "Field requested", 'class': "input form-control", 'rows': "5", 'cols': "100", 'maxlength': "500"})
            
            super(BugReportForm, self).__init__(*args, **kwargs)

        class Meta:
            model = BugReport
            fields = ['url', 'description']
