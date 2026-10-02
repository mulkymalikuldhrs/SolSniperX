import asyncio
from asyncio import run_coroutine_threadsafe

_background_loop = None

def set_background_loop(loop):
    global _background_loop
    _background_loop = loop

def get_background_loop():
    global _background_loop
    return _background_loop

def run_async(coro):
    """
    Executes an async coroutine on the global background loop safely from Flask synchronous view functions.
    This avoids asgiref's AsyncToSync conflict with Eventlet's monkey patching.
    """
    loop = get_background_loop()
    if loop is None or not loop.is_running():
        # Fallback if no running loop is set
        return asyncio.run(coro)
    future = run_coroutine_threadsafe(coro, loop)
    return future.result()
