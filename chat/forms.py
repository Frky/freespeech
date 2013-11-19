from django.contrib.auth.forms import UserCreationForm
from django import forms
from django.db import models

from chat.models import Comptoir


class ComptoirForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        self.base_fields['title'].label = "Name"
        self.base_fields['title'].widget = forms.TextInput(attrs={'placeholder': "Field requested", 'class': "form-control"})
        self.base_fields['description'].label = "Description"
        self.base_fields['description'].widget = forms.TextInput(attrs={'placeholder': "", 'class': "form-control"})
        self.base_fields['public'].label = "Public ?"
        self.base_fields['password'].label = "Password"
        self.base_fields['password'].widget = forms.TextInput(attrs={'placeholder': "", 'class': "form-control"})
        super(ComptoirForm, self).__init__(*args, **kwargs)

    class Meta:
        model = Comptoir
        fields = ['title', 'description', 'public', 'password']
