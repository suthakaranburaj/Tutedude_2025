from django.urls import path
from .views import recommend_vendors, total_products , add_product_view                 

urlpatterns = [
    path('', recommend_vendors, name='recommend_vendors'),
    path('count/', total_products, name='total_products'),
    path('add/', add_product_view, name='add_product'),
]