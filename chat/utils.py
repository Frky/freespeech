

def date_to_tooltip(date):
    """ 
        Take a date in input (object), and return 
        a string formatted to be displayed in tooltips
        on the template

    """

    return date.strftime("%l:%M ") + ("p.m." if date.strftime("%p") == "PM" else "a.m.")
