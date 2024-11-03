import json

from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404
from django.views.decorators.http import require_POST

from task.forms import TaskForm
from task.models import Task


def to_do(request):
    context = {
        "form": TaskForm()
    }
    return render(request, 'task/home.html', context)


def to_do_get(request):
    if request.method == 'GET':

        q = request.GET.get('q', '')

        if q:
            todo_objs = Task.todo.filter(title__icontains=q).values('id', 'title', 'description', 'created_at',
                                                                    'updated_at')
            done_objs = Task.done.filter(title__icontains=q).values('id', 'title', 'description', 'created_at',
                                                                    'updated_at')
        else:
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


@require_POST
def create(request):
    form = TaskForm(data=request.POST)
    if form.is_valid():
        form.save()
        return JsonResponse({"message": "Topshiriq muvoffaqiyatli yaratildi!"})
    return JsonResponse({
        "message": "Topshiriq yaratishda xatolik yuz berdi.",
        "errors": form.errors  # Return form validation errors
    })


@require_POST
def delete_task(request):
    task_id = json.loads(request.body).get('id')
    task = Task.objects.filter(id=task_id).first()
    if task:
        task.delete()
        return JsonResponse({"message": "Topshiriq o'chirildi."})
    return JsonResponse({"message": "Topshiriq o'chirish uchun topilmadi."})
