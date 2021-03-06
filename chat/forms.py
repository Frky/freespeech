from django.contrib.auth.forms import UserCreationForm
from django import forms
from django.db import models
from django.core.validators import MinLengthValidator, MaxLengthValidator

from chat.models import Comptoir, BugReport
from chat.labels import SHA3_HINT
from chat.renders import CustomRadioRenderer

class ComptoirForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        self.base_fields['key_hash'].validators = [v for v in self.base_fields['key_hash'].validators if not isinstance(v, MinLengthValidator)]
        self.base_fields['key_hash'].validators.append(MinLengthValidator(128))

        super(ComptoirForm, self).__init__(*args, **kwargs)

    def clean(self):
        data_ = self.data.copy()
        tmp = False
        if self.data['public'] == 'private':
            del data_['public']
            tmp = True
        self.data = data_.copy()

        cleaned_data = super(ComptoirForm, self).clean()

        if tmp:
            cleaned_data['public'] = False
        return cleaned_data

    class Meta:
        model = Comptoir
        fields = ('title', 'description', 'public', 'key_hash')
        labels = {
            'title': '',
            'description': '',
            'public': '',
            'key_hash': '',
        }
        widgets = {
            'title': forms.TextInput(attrs={'placeholder': "name", 'class': ""}),
            'description': forms.TextInput(attrs={'placeholder': "description", 'class': ""}),
            'key_hash': forms.TextInput(attrs={'id': "comptoir-key-hash", 'class': "optional hidden", 'placeholder': "SHA3 of the key (you may generate a key)"}),
            'public': forms.RadioSelect(
                            attrs={'id': "comptoir-public-switch", 'class': "radio"}, 
                            choices=[('public', 'Public'), ('private', 'Private')],
                            renderer=CustomRadioRenderer,
                                ),
        }
        
        # help_texts = {
        #    'key_hash': SHA3_HINT,
        # }



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
