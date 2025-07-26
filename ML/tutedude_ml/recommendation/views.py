from django.http import JsonResponse
from django.views.decorators.http import require_GET
from .utils import get_recommendations


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