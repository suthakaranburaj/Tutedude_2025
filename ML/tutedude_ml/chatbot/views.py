# views.py
from flask import request, jsonify
from .rag import process_user_prompt  # custom function

def chat():
    if request.method == 'OPTIONS':
        return jsonify({"status": "preflight"}), 200

    data = request.get_json(force=True)
    prompt = data.get('prompt', '').strip()
    if not prompt:
        return jsonify({"error": "Empty prompt"}), 400

    bot_response, vendor_context = process_user_prompt(prompt)
    return jsonify({
        "user_prompt": prompt,
        "vendor_context": vendor_context,
        "bot_response": bot_response
    })
