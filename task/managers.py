from django.db.models import Manager


class TaskDoneManager(Manager):
    def get_queryset(self):
        return super().get_queryset().filter(is_done=True)


class TaskToDoManager(Manager):
    def get_queryset(self):
        return super().get_queryset().filter(is_done=False)
