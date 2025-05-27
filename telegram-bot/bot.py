import logging
import requests # Added
import json     # Added
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes

# Enable logging
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO
)
logger = logging.getLogger(__name__)

# Define LangChain API URL (Added)
LANGCHAIN_API_URL = "http://localhost:5001/api/guidance"

# Define the start command handler
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Sends a welcome message when the /start command is issued."""
    mini_app_url = "YOUR_MINI_APP_URL"  # Placeholder for the mini-app URL
    await update.message.reply_text(
        f"Hello! Welcome to the Conflict Resolution Bot. Please open the mini-app to get started: {mini_app_url}"
    )

# New command handler for onboarding_complete (Added)
async def onboarding_complete(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Simulates onboarding completion and fetches guidance from LangChain API."""
    # Dummy onboarding data
    dummy_onboarding_data = {
        "conflict_description": "Argument with my roommate about cleaning schedules.",
        "parties_involved": "Me and my roommate, John Doe.",
        "relationship_with_parties": "Roommates, generally friendly.",
        "attempts_made": "Tried discussing it calmly, but it led to more arguments.",
        "mediator_preference": "neutral", # From MediatorSelection
        "desired_outcome": "A fair cleaning schedule that we both stick to.", # From GoalSetting
        "willing_to_compromise": "Flexible on specific days, as long as it's consistent.", # From GoalSetting
        "ideal_resolution_timeframe": "Within the next week." # From GoalSetting
    }
    
    payload = {"onboarding_data": dummy_onboarding_data}
    
    try:
        logger.info(f"Sending data to LangChain API: {payload}")
        response = requests.post(LANGCHAIN_API_URL, json=payload, timeout=30) # Added timeout
        response.raise_for_status()  # Raise an exception for HTTP errors
        api_response = response.json()
        guidance = api_response.get("guidance", "No guidance received.")
        await update.message.reply_text(f"Onboarding data processed.\nHere's some initial guidance for you:\n\n{guidance}")
    except requests.exceptions.RequestException as e:
        logger.error(f"Error calling LangChain API: {e}")
        await update.message.reply_text("Sorry, I couldn't process your onboarding data at the moment. Please try again later.")
    except json.JSONDecodeError:
        logger.error(f"Error decoding JSON response from LangChain API: {response.text}")
        await update.message.reply_text("Sorry, I received an invalid response from the guidance service. Please try again later.")


# Modified handler for group messages (Updated)
async def handle_group_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handles messages sent in group chats and gets guidance from LangChain API."""
    user_message = update.message.text
    user_info = update.message.from_user.username or update.message.from_user.first_name
    
    logger.info(f"Received message in group {update.message.chat.id} from {user_info}: {user_message}")

    # Construct payload for LangChain API. 
    # For now, we'll pass it as if it's part of 'onboarding_data' or a general query.
    # The LangChain prompt might need adjustment to handle this type of input.
    payload = {
        "onboarding_data": { # Using the existing structure for now
            "context": "group_message_discussion",
            "user_query": user_message,
            "user_info": user_info,
            "group_chat_id": update.message.chat.id
        }
    }

    try:
        logger.info(f"Sending group message data to LangChain API: {payload}")
        response = requests.post(LANGCHAIN_API_URL, json=payload, timeout=30) # Added timeout
        response.raise_for_status()
        api_response = response.json()
        guidance = api_response.get("guidance", "Sorry, I couldn't get a helpful suggestion right now.")
        
        # Reply in the group
        await update.message.reply_text(f"Regarding \"{user_message}\":\n\n{guidance}")
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Error calling LangChain API for group message: {e}")
        await update.message.reply_text("I'm having trouble processing that message. Please try again later.")
    except json.JSONDecodeError:
        logger.error(f"Error decoding JSON response from LangChain API for group message: {response.text}")
        await update.message.reply_text("Sorry, I received an invalid response from the processing service. Please try again later.")


def main() -> None:
    """Start the bot."""
    # Create the Application and pass it your bot's token.
    # Ensure YOUR_TELEGRAM_BOT_TOKEN is set in your environment or config
    application = Application.builder().token("YOUR_TELEGRAM_BOT_TOKEN").build() 

    # on different commands - answer in Telegram
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("onboarding_complete", onboarding_complete)) # Added

    # on non command i.e message - handle group messages
    application.add_handler(MessageHandler(filters.TEXT & filters.ChatType.GROUPS & ~filters.COMMAND, handle_group_message))

    # Run the bot until the user presses Ctrl-C
    application.run_polling()

if __name__ == "__main__":
    main()
