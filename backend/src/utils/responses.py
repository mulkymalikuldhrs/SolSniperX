# backend/src/utils/responses.py

import os
from flask import jsonify
from datetime import datetime

# Only expose internal error details in development mode
_DEBUG = os.getenv('FLASK_DEBUG', 'false').lower() in ('true', '1', 'yes')

def success_response(data=None, message=None, **kwargs):
    """
    Creates a standardized success JSON response.
    """
    response = {
        'success': True,
        'timestamp': datetime.now().isoformat()
    }
    if data is not None:
        response['data'] = data
    if message:
        response['message'] = message
    
    # Add any other custom key-value pairs
    response.update(kwargs)
    
    return jsonify(response)

def error_response(error_message, status_code=500, details=None):
    """
    Creates a standardized error JSON response.
    Internal error details are only exposed when FLASK_DEBUG=true.
    """
    response = {
        'success': False,
        'error': error_message,
        'timestamp': datetime.now().isoformat()
    }
    # Never leak internal error details to clients in production
    if details and _DEBUG:
        response['details'] = str(details)
        
    return jsonify(response), status_code