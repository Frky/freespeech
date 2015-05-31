
import pytz

from django import template

from freespeech.settings import TIME_ZONE
from chat.utils import date_to_tooltip

timezone_local = pytz.timezone(TIME_ZONE)
register = template.Library()

@register.filter(name='ownership')
def ownership(owner, me):
    if owner == me:
        return "myself"
    else:
        return "other"


@register.filter(name='format_day')
def format_day(date):
    return date.astimezone(timezone_local).strftime("%b. %e,")


@register.filter(name='format_time')
def format_time(date):
    return date_to_tooltip(date.astimezone(timezone_local))
