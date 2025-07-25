# backend/src/utils/responses.py

from flask import jsonify
from datetime import datetime

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
    """
    response = {
        'success': False,
        'error': error_message,
        'timestamp': datetime.now().isoformat()
    }
    if details:
        response['details'] = str(details)
        
    return jsonify(response), status_code