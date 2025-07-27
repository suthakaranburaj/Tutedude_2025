# rag.py
import re
from pymongo import MongoClient
import google.generativeai as genai
import os

mongo = MongoClient(os.getenv("MONGODB_URL"))
db = mongo.get_default_database()
collection = db['vendor_user_product']

genai.configure(api_key=os.getenv("GEMINI_API"))
model = genai.GenerativeModel("gemini-2.0-flash")

def extract_filters(prompt):
    filters = {}
    product = re.search(r'\\b([A-Z][a-z]+es?)\\b', prompt)
    if product:
        filters["product_name"] = product.group(1)
    price = re.search(r'price.*?(below|above)\\s*(\\d+)', prompt, re.I)
    if price:
        op, val = price.groups()
        filters["price_per_kg"] = {"$lt": float(val)} if op.lower() == "below" else {"$gt": float(val)}
    return filters

def retrieve_docs(filters, limit=5):
    return list(collection.find(filters, {"_id": 0}).limit(limit))

def process_user_prompt(prompt):
    filters = extract_filters(prompt)
    docs = retrieve_docs(filters)
    context = "\n".join([f"Vendor {d['vendor_id']} - {d['product_name']} ₹{d['price_per_kg']} {d['available_quantity']}kg" for d in docs]) or "No matching vendor data."
    full_input = f"Vendor Data:\n{context}\n\nUser: {prompt}"
    response = model.generate_content(full_input)
    return response.text, docs
