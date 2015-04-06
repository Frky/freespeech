from django import template

register = template.Library()

@register.filter(name='ownership')
def ownership(owner, me):
    if owner == me:
        return "myself"
    else:
        return "other"
