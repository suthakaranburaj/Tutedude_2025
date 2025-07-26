# recommendation/management/commands/seed_data.py
import random
from django.core.management.base import BaseCommand
from recommendation.utils import collection

class Command(BaseCommand):
    help = 'Seed MongoDB with sample vendor-product records'

    def handle(self, *args, **options):
        product_names = [
            'Apples', 'Bananas', 'Carrots', 'Dates', 'Eggplants',
            'Figs', 'Grapes', 'Honeydew', 'Iceberg Lettuce', 'Jackfruit',
            'Kiwis', 'Lemons', 'Mangoes', 'Nectarines', 'Oranges',
            'Peaches', 'Quinces', 'Raspberries', 'Strawberries', 'Tomatoes'
        ]

        entries = []
        for i in range(1, 101):
            entry = {
                'vendor_id': random.randint(1, 20),
                'product_name': random.choice(product_names),
                'price_per_kg': round(random.uniform(5, 100), 2),
                'available_quantity': random.randint(10, 200),
                'total_orders': random.randint(0, 500),
                'total_spent': round(random.uniform(100, 10000), 2)
            }
            entries.append(entry)

        result = collection.insert_many(entries)
        self.stdout.write(self.style.SUCCESS(
            f'Successfully inserted {len(result.inserted_ids)} sample records.'
        ))