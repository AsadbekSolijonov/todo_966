from django.db import models
from django.db.models import Manager

from task.managers import TaskDoneManager, TaskToDoManager


class Task(models.Model):
    title = models.CharField(max_length=100)  # title*
    description = models.TextField()  # description*
    is_done = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = Manager()
    done = TaskDoneManager()
    todo = TaskToDoManager()

    def __str__(self):
        return self.title
