import os
from flask import Flask, request, jsonify
from flask_cors import CORS # Added
from langchain_openai import ChatOpenAI
from langchain.schema import SystemMessage, HumanMessage
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app) # Added: Enable CORS for all routes

# Initialize ChatOpenAI
# Ensure OPENAI_API_KEY is loaded correctly
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise ValueError("OPENAI_API_KEY not found in environment variables. Make sure it's set in the .env file.")

llm = ChatOpenAI(openai_api_key=openai_api_key)

@app.route('/api/guidance', methods=['POST'])
def get_guidance():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        onboarding_data = data.get('onboarding_data')
        if not onboarding_data:
            return jsonify({"error": "Missing 'onboarding_data' in request"}), 400

        # For now, just convert the whole onboarding_data dict to a string for the prompt
        # We can refine this later to be more specific.
        prompt_data_str = str(onboarding_data)

        # Create a simple prompt
        messages = [
            SystemMessage(content="You are a helpful assistant for conflict resolution. Your role is to provide initial guidance based on user's onboarding information."),
            HumanMessage(content=f"The user provided the following onboarding data: {prompt_data_str}. Based on this, suggest a concise next step or piece of advice for them to consider.")
        ]

        # Get response from LLM
        llm_response = llm.invoke(messages)
        
        # Extract content from the response
        response_content = llm_response.content if hasattr(llm_response, 'content') else str(llm_response)

        return jsonify({"guidance": response_content})

    except Exception as e:
        # Log the error for debugging
        app.logger.error(f"Error in /api/guidance: {str(e)}")
        return jsonify({"error": "An internal error occurred", "details": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)
