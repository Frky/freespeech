from django.contrib.auth.forms import UserCreationForm
from django import forms
from django.db import models

from chat.models import Comptoir


class ComptoirForm(forms.ModelForm):

    key = forms.CharField(label="Comptoir secret key", max_length=255, min_length=255, widget=forms.TextInput(
        {'placeholder': "Field requested", 'class': "form-control", 'id': "comptoir_key"
    }))

    def __init__(self, *args, **kwargs):
        self.base_fields['title'].label = "Name"
        self.base_fields['title'].widget = forms.TextInput(attrs={'placeholder': "Field requested", 'class': "form-control"})
        self.base_fields['description'].label = "Description"
        self.base_fields['description'].widget = forms.TextInput(attrs={'placeholder': "", 'class': "form-control"})
        self.base_fields['public'].label = "Public ?"
        self.base_fields['password'].label = "Password"
        self.base_fields['password'].widget = forms.TextInput(attrs={'placeholder': "", 'class': "form-control"})
#        self.base_fields['key'] = forms.TextInput()
#        self.key.label="Comptoir secret key"
#        self.key.widget = forms.TextInput(attrs={'placeholder': "Field requested", 'class': "form-control", 'id':"comptoir_key"})
        self.base_fields['key_hash'].label="key_hash"
        self.base_fields['key_hash'].widget = forms.HiddenInput(attrs={'id': "comptoir_hash_key"})
        super(ComptoirForm, self).__init__(*args, **kwargs)

    class Meta:
        model = Comptoir
        fields = ['title', 'description', 'public', 'password', 'key_hash']

class RegisterForm(UserCreationForm):

    def __init__(self, *args, **kwargs):
        # self.base_fields['username'].label = ""

        self.base_fields['username'].widget = forms.TextInput(attrs={'placeholder': "Username", 'class': "form-control"})
        self.base_fields['password1'].widget = forms.TextInput(attrs={'type': 'password', 'placeholder': "Password", 'class': "form-control"})
        self.base_fields['password2'].widget = forms.TextInput(attrs={'type': 'password', 'placeholder': "Password (again)", 'class': "form-control"})

        super(RegisterForm, self).__init__(*args, **kwargs)
