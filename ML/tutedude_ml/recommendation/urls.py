from django.urls import path
from .views import recommend_vendors

urlpatterns = [
    path('', recommend_vendors, name='recommend_vendors'),
]