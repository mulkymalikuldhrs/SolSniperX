import asyncio

# Global background loop to be shared across the application
background_loop = None

def set_background_loop(loop):
    global background_loop
    background_loop = loop

def get_background_loop():
    return background_loop
