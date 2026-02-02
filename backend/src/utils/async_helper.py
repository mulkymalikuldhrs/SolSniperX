import asyncio
from flask import current_app

def run_async(coro):
    """
    Runs an asyncio coroutine in the background thread's event loop and returns the result.
    """
    future = asyncio.run_coroutine_threadsafe(coro, current_app.bg_loop)
    return future.result()
