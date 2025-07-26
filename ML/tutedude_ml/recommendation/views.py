from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
import json
from .utils import get_recommendations, check_connection, get_total_products, add_product

check_connection()  # Ensure MongoDB connection is established
@require_GET
def recommend_vendors(request):
    """
    Endpoint: /api/recommend/?product=Tomatoes&top_n=5
    """
    product = request.GET.get('product')
    top_n = int(request.GET.get('top_n', 5))
    if not product:
        return JsonResponse({'error': 'Missing product parameter.'}, status=400)

    recs = get_recommendations(product, top_n)
    return JsonResponse({'recommendations': recs}, safe=False)

@require_GET
def total_products(request):
    count = get_total_products()
    return JsonResponse({'total_products': count})

@csrf_exempt
@require_POST
def add_product_view(request):
    body = json.loads(request.body)
    _id = add_product(
        body.get("vendor_id"),
        body.get("product_name"),
        body.get("price_per_kg"),
        body.get("available_quantity"),
        body.get("total_orders"),
        body.get("total_spent")
    )
    return JsonResponse({"inserted_id": _id})