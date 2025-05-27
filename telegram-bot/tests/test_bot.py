import pytest
import asyncio # Required for async functions
from unittest.mock import AsyncMock, MagicMock, patch # AsyncMock for async methods, MagicMock for others

# Assuming bot.py is in the parent directory or PYTHONPATH is set up correctly
# For testing, it's common to adjust sys.path or use relative imports if structure allows
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from bot import start, onboarding_complete, handle_group_message, LANGCHAIN_API_URL # Import handlers and constants
from telegram import Update, Message, User, Chat # Import necessary Telegram objects

# --- Helper to run async functions ---
def run_async(func):
    return asyncio.run(func)

# --- Tests for /start command ---
@pytest.mark.asyncio
async def test_start_command():
    """Test the /start command handler."""
    update = MagicMock(spec=Update)
    update.message = AsyncMock(spec=Message)
    update.message.reply_text = AsyncMock() # Use AsyncMock for awaitable methods

    await start(update, None) # Context is not used in start handler

    update.message.reply_text.assert_called_once()
    args, _ = update.message.reply_text.call_args
    assert "Hello! Welcome to the Conflict Resolution Bot." in args[0]
    assert "YOUR_MINI_APP_URL" in args[0] # Check for placeholder URL

# --- Tests for /onboarding_complete command ---
@pytest.mark.asyncio
async def test_onboarding_complete_success():
    """Test /onboarding_complete with a successful API call."""
    update = MagicMock(spec=Update)
    update.message = AsyncMock(spec=Message)
    update.message.reply_text = AsyncMock()
    
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {"guidance": "Test guidance from API"}
    
    with patch('requests.post', return_value=mock_response) as mock_post:
        await onboarding_complete(update, None) # Context not used

        mock_post.assert_called_once()
        called_url = mock_post.call_args[0][0]
        called_payload = mock_post.call_args[1]['json']
        
        assert called_url == LANGCHAIN_API_URL
        assert "conflict_description" in called_payload["onboarding_data"] # Check a key from dummy data
        
        update.message.reply_text.assert_called_once()
        args, _ = update.message.reply_text.call_args
        assert "Test guidance from API" in args[0]

@pytest.mark.asyncio
async def test_onboarding_complete_api_request_exception():
    """Test /onboarding_complete when requests.post raises an exception."""
    update = MagicMock(spec=Update)
    update.message = AsyncMock(spec=Message)
    update.message.reply_text = AsyncMock()
    
    with patch('requests.post', side_effect=requests.exceptions.RequestException("Network Error")) as mock_post:
        await onboarding_complete(update, None)
        
        mock_post.assert_called_once() # Ensure it was called
        update.message.reply_text.assert_called_once_with(
            "Sorry, I couldn't process your onboarding data at the moment. Please try again later."
        )

@pytest.mark.asyncio
async def test_onboarding_complete_api_bad_status():
    """Test /onboarding_complete when API returns a non-200 status."""
    update = MagicMock(spec=Update)
    update.message = AsyncMock(spec=Message)
    update.message.reply_text = AsyncMock()
    
    mock_response = MagicMock()
    mock_response.status_code = 500
    mock_response.raise_for_status.side_effect = requests.exceptions.HTTPError("Server Error")
    
    with patch('requests.post', return_value=mock_response) as mock_post:
        await onboarding_complete(update, None)
        
        mock_post.assert_called_once()
        update.message.reply_text.assert_called_once_with(
            "Sorry, I couldn't process your onboarding data at the moment. Please try again later."
        )

# --- Tests for handle_group_message ---
@pytest.mark.asyncio
async def test_handle_group_message_success():
    """Test handle_group_message with a successful API call."""
    update = MagicMock(spec=Update)
    update.message = AsyncMock(spec=Message)
    update.message.text = "This is a test group message."
    update.message.from_user = MagicMock(spec=User)
    update.message.from_user.username = "testuser"
    update.message.chat = MagicMock(spec=Chat)
    update.message.chat.id = 12345

    update.message.reply_text = AsyncMock()
    
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {"guidance": "Group guidance from API"}
    
    with patch('requests.post', return_value=mock_response) as mock_post:
        await handle_group_message(update, None) # Context not used

        mock_post.assert_called_once()
        called_url = mock_post.call_args[0][0]
        called_payload = mock_post.call_args[1]['json']['onboarding_data'] # Access nested data
        
        assert called_url == LANGCHAIN_API_URL
        assert called_payload["user_query"] == "This is a test group message."
        assert called_payload["user_info"] == "testuser"
        assert called_payload["group_chat_id"] == 12345
        
        update.message.reply_text.assert_called_once()
        args, _ = update.message.reply_text.call_args
        assert "Group guidance from API" in args[0]
        assert "Regarding \"This is a test group message.\":" in args[0]

@pytest.mark.asyncio
async def test_handle_group_message_api_request_exception():
    """Test handle_group_message when requests.post raises an exception."""
    update = MagicMock(spec=Update)
    update.message = AsyncMock(spec=Message)
    update.message.text = "Another group message."
    update.message.from_user = MagicMock(spec=User)
    update.message.from_user.username = "err_user"
    update.message.chat = MagicMock(spec=Chat)
    update.message.chat.id = 67890
    update.message.reply_text = AsyncMock()
    
    with patch('requests.post', side_effect=requests.exceptions.RequestException("Network Failure")) as mock_post:
        await handle_group_message(update, None)
        
        mock_post.assert_called_once()
        update.message.reply_text.assert_called_once_with(
            "I'm having trouble processing that message. Please try again later."
        )

@pytest.mark.asyncio
async def test_handle_group_message_api_bad_status():
    """Test handle_group_message when API returns a non-200 status."""
    update = MagicMock(spec=Update)
    update.message = AsyncMock(spec=Message)
    update.message.text = "Bad status message."
    update.message.from_user = MagicMock(spec=User)
    update.message.from_user.username = "status_user"
    update.message.chat = MagicMock(spec=Chat)
    update.message.chat.id = 11223
    update.message.reply_text = AsyncMock()
    
    mock_response = MagicMock()
    mock_response.status_code = 403 # Simulate a forbidden error, for example
    mock_response.raise_for_status.side_effect = requests.exceptions.HTTPError("Client Error")

    with patch('requests.post', return_value=mock_response) as mock_post:
        await handle_group_message(update, None)
        
        mock_post.assert_called_once()
        update.message.reply_text.assert_called_once_with(
            "I'm having trouble processing that message. Please try again later."
        )

# This is needed because bot.py imports requests, and tests mock it.
# We need to ensure the real requests is available for the test file itself if it were to use it,
# but more importantly, to allow mocking to work correctly on the bot's import of requests.
import requests
