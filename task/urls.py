from django.urls import path
from task import views

urlpatterns = [
    path('', views.to_do, name='home'),
    path('urls/', views.to_do_get, name='home-js'),  # For dynamic fetching of tasks
    path('receiver/', views.receiver_reminder, name="receiver-reminder"),  # For marking tasks as done/undone
]