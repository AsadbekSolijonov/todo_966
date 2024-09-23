from django.shortcuts import render
from task.models import Task


def home(request):
    objs = Task.objects.all()
    context = {
        'objects': objs
    }
    return render(request, 'task/home.html', context)

