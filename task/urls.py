from django.urls import path
from task import views

urlpatterns = [
    path('', views.home, name='home'),
]