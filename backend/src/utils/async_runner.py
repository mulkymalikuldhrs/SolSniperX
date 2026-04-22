import asyncio
import logging
from concurrent.futures import TimeoutError

logger = logging.getLogger(__name__)

def run_async(coro, timeout=30):
    """
    Runs a coroutine in the background asyncio loop and waits for the result.
    """
    from globals import get_background_loop
    background_loop = get_background_loop()
    if background_loop is None:
        logger.error("Background loop not initialized.")
        raise RuntimeError("Background loop not initialized.")

    try:
        future = asyncio.run_coroutine_threadsafe(coro, background_loop)
        return future.result(timeout=timeout)
    except TimeoutError:
        logger.error(f"Async operation timed out after {timeout}s")
        raise
    except Exception as e:
        logger.error(f"Error running async operation: {e}")
        raise
