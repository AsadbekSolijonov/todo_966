from django import forms

from task.models import Task


class TaskForm(forms.ModelForm):
    class Meta:
        model = Task
        fields = ['title', 'description', 'is_done']
        widgets = {
            "title": forms.TextInput(attrs={'class': 'form-control border'}),
            "description": forms.Textarea(attrs={'class': 'form-control border'}),
            "is_done": forms.CheckboxInput(attrs={"class": "form-check-input"})
        }
