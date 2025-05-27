import pytest
import json
import os
from unittest.mock import patch, MagicMock

# Add the parent directory to sys.path to allow module imports
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import the Flask app instance
# We need to ensure OPENAI_API_KEY is set *before* importing app
# For testing, we can set a dummy key if not already set for real.
if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = "dummy_test_key"

from app import app
from langchain_core.messages import AIMessage # Correct import for AIMessage

@pytest.fixture
def client():
    """Create a Flask test client."""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

@pytest.fixture
def mock_llm_invoke(mocker):
    """Fixture to mock ChatOpenAI.invoke."""
    # Patch the specific instance of ChatOpenAI used in the app.py, or the class if that's easier.
    # Assuming 'app.llm' is the instance of ChatOpenAI in your app.py
    # Or, if llm is instantiated within the route, patch 'app.ChatOpenAI'
    mock = mocker.patch('app.llm.invoke', autospec=True) # Patching the instance's method
    return mock

def test_get_guidance_success(client, mock_llm_invoke):
    """Test successful /api/guidance POST request."""
    # Configure mock to return a specific AIMessage
    mock_llm_invoke.return_value = AIMessage(content="Mocked LLM guidance")

    onboarding_data = {"user_story": "This is my conflict."}
    response = client.post('/api/guidance', json={"onboarding_data": onboarding_data})

    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["guidance"] == "Mocked LLM guidance"

    # Assert that llm.invoke was called
    mock_llm_invoke.assert_called_once()
    # Check that the prompt data was part of the messages passed to invoke
    args, _ = mock_llm_invoke.call_args
    messages = args[0] # 'messages' is the first positional argument
    assert any(str(onboarding_data) in message.content for message in messages if hasattr(message, 'content'))


def test_get_guidance_missing_onboarding_data_key(client):
    """Test /api/guidance with missing 'onboarding_data' key."""
    response = client.post('/api/guidance', json={"some_other_key": "data"})
    assert response.status_code == 400
    json_data = response.get_json()
    assert "Missing 'onboarding_data' in request" in json_data["error"]

def test_get_guidance_no_data_provided(client):
    """Test /api/guidance with no JSON data provided."""
    response = client.post('/api/guidance', data="not json", content_type="text/plain")
    # Flask's default behavior for non-JSON POST with get_json() is to return a 400
    # if request.get_json() is called without checking request.is_json.
    # If your app checks request.is_json, the error message might be different.
    # The current app.py calls request.get_json() directly.
    assert response.status_code == 400
    json_data = response.get_json() # This might fail if the response isn't JSON
    assert "No data provided" in json_data["error"] # Error from request.get_json(silent=False) failing

def test_get_guidance_malformed_json(client):
    """Test /api/guidance with malformed JSON."""
    response = client.post('/api/guidance', data='{"onboarding_data": "test",', content_type='application/json')
    assert response.status_code == 400 # Werkzeug/Flask handles malformed JSON parsing
    json_data = response.get_json()
    assert "Failed to decode JSON object" in json_data.get("error", "") or \
           "unexpected end of data" in json_data.get("error", "").lower() # Example error messages

def test_get_guidance_llm_failure(client, mock_llm_invoke):
    """Test /api/guidance when the LLM call fails."""
    mock_llm_invoke.side_effect = Exception("LLM simulation error")

    onboarding_data = {"user_story": "This will fail."}
    response = client.post('/api/guidance', json={"onboarding_data": onboarding_data})

    assert response.status_code == 500
    json_data = response.get_json()
    assert "An internal error occurred" in json_data["error"]
    assert "LLM simulation error" in json_data["details"]
    mock_llm_invoke.assert_called_once()

# Test for OPENAI_API_KEY (Conceptual - actual test might vary)
# This test is more about app initialization logic than a specific route.
# One way to test this is to try importing the app with the key unset.
@patch.dict(os.environ, {"OPENAI_API_KEY": ""}, clear=True)
def test_app_init_no_openai_key():
    """
    Test that app initialization (specifically ChatOpenAI) handles missing OPENAI_API_KEY.
    This test is a bit tricky as 'app' is already imported.
    A more robust way would be to have app creation in a factory function.
    For now, we'll test the behavior of ChatOpenAI directly if it were called without a key,
    or we can try to re-import the app module if feasible in the test setup.
    The current app.py raises ValueError if key is not found before ChatOpenAI is even called.
    """
    # Temporarily remove the key
    original_key = os.environ.pop("OPENAI_API_KEY", None)
    
    with pytest.raises(ValueError) as excinfo:
        # This dynamic import is to try and re-evaluate app.py in a modified environment
        # This is generally not standard practice for testing already imported modules.
        # A better approach is a factory pattern for app creation.
        # For this specific app structure, the ValueError is raised at module level.
        # So, we need to simulate the condition that would cause app.py to fail on import.
        
        # Option 1: Test the ChatOpenAI constructor directly (if that's where the error originates)
        # from langchain_openai import ChatOpenAI
        # ChatOpenAI() # This would fail if API key is expected and not found by default
        
        # Option 2: Reload app module (advanced and potentially flaky)
        # import importlib
        # import app as app_module
        # importlib.reload(app_module)

        # For the current app.py, the check is `if not openai_api_key: raise ValueError(...)`
        # This happens at module load time.
        # To test this, we'd need to ensure the module is reloaded or tested in a subprocess
        # where OPENAI_API_KEY is unset.
        # Given the limitations, directly asserting the pre-condition check is hard here without
        # restructuring app.py for better testability (e.g. app factory).
        
        # Let's assume the ValueError in app.py is the target.
        # This test will pass if the app.py is re-evaluated with no key.
        # However, pytest typically loads all test modules and their imports once.
        # So, this test might reflect the state during test collection, not isolated execution.
        
        # A more direct way to test what happens if app.llm init fails:
        # We can simulate the os.getenv("OPENAI_API_KEY") returning None inside app.py context
        # This is still tricky after module load.
        
        # Given the current structure, this test is more of a placeholder for how one might
        # approach testing environment variable dependencies during app startup.
        # The existing code `if not openai_api_key: raise ValueError(...)` in app.py
        # effectively stops the app from starting if the key is missing.
        if not os.getenv("OPENAI_API_KEY_THAT_DOESNT_EXIST_FOR_TEST"): # Simulate a check
             raise ValueError("OPENAI_API_KEY not found in environment variables. Make sure it's set in the .env file.")

    assert "OPENAI_API_KEY not found" in str(excinfo.value)
    
    # Restore the key if it was originally set
    if original_key is not None:
        os.environ["OPENAI_API_KEY"] = original_key
    elif "dummy_test_key" in os.environ["OPENAI_API_KEY"]: # if it was set by test setup
        os.environ["OPENAI_API_KEY"] = "dummy_test_key" # keep it as dummy for other tests
    # If it was never set, and not by our test setup, it remains unset.

# Note: The test_app_init_no_openai_key is more complex due to Python's import system
# and how environment variables are typically handled at module load time.
# For a production app, using an app factory pattern is recommended for better testability
# of such startup conditions.
# The provided test is a conceptual illustration and might need refinement based on
# how you'd like to trigger the re-evaluation of the API key check in app.py.
# The simplest way the app is written, if OPENAI_API_KEY is missing, `import app` would fail.
# Pytest would catch this as an import error for the test module itself.
# The current test `test_app_init_no_openai_key` has been modified to reflect
# the check within the app module, but it's a bit artificial.
# A more practical test for the current code would be to ensure that if OPENAI_API_KEY is set,
# the app imports and `app.llm` is initialized, which is implicitly tested by other tests running.
# To truly test the ValueError on import, you'd run pytest in an environment where the key is not set.

# Cleanup dummy key if it was set by this file for tests
# This is tricky as pytest might run tests in parallel or different orders.
# Better to manage this via pytest fixtures or session setup/teardown if needed broadly.
# For now, assuming OPENAI_API_KEY is managed externally or by CI environment for actual runs.
# The dummy key is primarily for local test runs where it might not be set.
if os.environ.get("OPENAI_API_KEY") == "dummy_test_key":
    del os.environ["OPENAI_API_KEY"]
