import os
from pymongo import MongoClient

# Initialize Mongo client
client = MongoClient(os.getenv('MONGODB_URL'))
db = client.get_default_database()
collection = db['vendor_user_product']

def check_connection():
    return client.admin.command('ping')



def get_recommendations(product_name, top_n=5):
    """
    Simple MVP: filter by product_name, sort by price_per_kg ASC and total_orders DESC.
    """
    pipeline = [
        {'$match': {'product_name': product_name}},
        {'$addFields': {
            'score': {
                '$add': [
                    {'$multiply': [{'$subtract': [100, '$price_per_kg']}, 1]},
                    {'$multiply': ['$total_orders', 2]}
                ]
            }
        }},
        {'$sort': {'score': -1}},
        {'$limit': top_n}
    ]
    results = list(collection.aggregate(pipeline))
    return results

def get_total_products():
    """Return count of distinct product names inside nested vendor-user-product."""
    return len(collection.distinct('vendor-user-product.product_name'))

def add_product(vendor_id, product_name, price_per_kg, available_quantity, total_orders, total_spent):
    data = {
        "vendor_id": vendor_id,
        "product_name": product_name,
        "price_per_kg": price_per_kg,
        "available_quantity": available_quantity,
        "total_orders": total_orders,
        "total_spent": total_spent
    }
    result = collection.insert_one(data)
    return str(result.inserted_id)
