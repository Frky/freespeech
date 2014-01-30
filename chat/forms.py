from django.contrib.auth.forms import UserCreationForm
from django import forms
from django.db import models
from django.core.validators import MinLengthValidator

from chat.models import Comptoir


class ComptoirForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        self.base_fields['title'].label = "Name"
        self.base_fields['title'].widget = forms.TextInput(attrs={'placeholder': "Field requested", 'class': "input form-control"})
        self.base_fields['description'].label = "Description"
        self.base_fields['description'].widget = forms.TextInput(attrs={'placeholder': "", 'class': "form-control"})
        self.base_fields['public'].label = "Public ?"
        self.base_fields['password'].label = "Password"
        self.base_fields['password'].widget = forms.TextInput(attrs={'placeholder': "", 'class': "form-control"})
#        self.base_fields['key'] = forms.TextInput()
#        self.key.label="Comptoir secret key"
#        self.key.widget = forms.TextInput(attrs={'placeholder': "Field requested", 'class': "form-control", 'id':"comptoir_key"})
        self.base_fields['key_hash'].validators = [v for v in self.base_fields['key_hash'].validators if not isinstance(v, MinLengthValidator)]
        self.base_fields['key_hash'].validators.append(MinLengthValidator(128))
        self.base_fields['key_hash'].label="Hash of the comptoir secret key"
        self.base_fields['key_hash'].widget = forms.TextInput(attrs={'id': "comptoir-key-hash", 'class': "form-control", 'placeholder': "Field requested (you may generate a key)"})
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
