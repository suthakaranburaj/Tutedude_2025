from flask import Flask
from flask_cors import CORS
from urls import api_bp

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://localhost:5174"]}})

app.register_blueprint(api_bp, url_prefix="/api")

if __name__ == "__main__":
    app.run(port=3000, debug=True)
