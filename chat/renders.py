
from django.template.loader import render_to_string
from django import forms
from django.utils.safestring import mark_safe

class CustomRadioRenderer(forms.RadioSelect.renderer):
    
    def render(self):
        return render_to_string('chat/render/radio_render.html', {'field': self})
