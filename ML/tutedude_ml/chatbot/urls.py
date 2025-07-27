# urls.py
from flask import Blueprint
from .views import chat

# Create blueprint
api_bp = Blueprint('api', __name__)

# Add routes
api_bp.add_url_rule('/chat', view_func=chat, methods=['POST', 'OPTIONS'])
