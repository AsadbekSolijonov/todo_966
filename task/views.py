import json

from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404
from task.models import Task


def to_do(request):
    todo_objs = Task.todo.all()
    done_objs = Task.done.all()

    context = {
        'todo_objects': todo_objs,
        'done_objects': done_objs

    }
    return render(request, 'task/home.html', context)


def to_do_get(request):
    if request.method == 'GET':
        todo_objs = Task.todo.all().values('id', 'title', 'description', 'created_at', 'updated_at')
        done_objs = Task.done.all().values('id', 'title', 'description', 'created_at', 'updated_at')

        data = {
            'todo_objects': list(todo_objs),
            'done_objects': list(done_objs)

        }
        return JsonResponse(data, safe=False)


def receiver_reminder(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        pk = data.get('id')
        task = get_object_or_404(Task, id=pk)
        if task:
            if task.is_done:
                task.is_done = False
            else:
                task.is_done = True
            task.save()
            return JsonResponse({"message": f"Server id={pk} ni muvoffaqqiyatli qabul qildi!"})
    return JsonResponse({"error": "Faqat ``POST`` so'rovlar qabul qiladi."})
