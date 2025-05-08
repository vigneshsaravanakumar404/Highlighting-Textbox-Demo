from flask import Flask, request, jsonify
from uuid import uuid4

# Constants
USER_QUESTION_LIMIT = 1000
MODEL = "gpt-4.1-nano"
FORM_SCHEME = {
    "name": {"type": "string", "question": "What is your full name?"},
    "age": {"type": "integer", "question": "What is your age?"},
    "position_applied": {
        "type": "string",
        "question": "What position are you applying for?",
    },
    "years_of_experience": {
        "type": "integer",
        "question": "How many years of experience do you have?",
    },
    "has_portfolio": {"type": "boolean", "question": "Do you have a portfolio?"},
    "github_link": {"type": "string", "question": "What is your GitHub link?"},
    "cover_letter_submitted": {
        "type": "boolean",
        "question": "Have you submitted a cover letter?",
    },
    "expected_salary": {"type": "integer", "question": "What is your expected salary?"},
    "willing_to_relocate": {
        "type": "boolean",
        "question": "Are you willing to relocate?",
    },
    "available_start_date": {
        "type": "string",
        "question": "What is your available start date?",
    },
    "certifications": {
        "type": "string",
        "question": "What certifications do you have?",
    },
    "has_reference_contacts": {
        "type": "boolean",
        "question": "Do you have reference contacts?",
    },
}

data_store = {}
session_store = {}  # Dictionary to associate session IDs with openAI ChatGPT sessions
app = Flask(__name__)


@app.route("/api/scheme", methods=["GET"])
def get_data():
    """
    Retrieves scheme data for the form

    Returns:
        - 200 OK: JSON object containing the scheme data.
    """
    return jsonify(FORM_SCHEME), 200


@app.route("/api/create_session", methods=["GET"])
def create_session():
    """
    Generates a unique session ID that does not exist in the session store.

    Returns:
        - 200 OK: Newly created session ID.
    """
    session_id = str(uuid4())
    while session_id in session_store:
        session_id = str(uuid4())

    session_store[session_id] = None
    return jsonify({"session_id": session_id}), 200


@app.route("/api/submit_form", methods=["POST"])
def submit_form():
    """
    Submits the form data and stores it in the data store.

    Returns:
        - 200 OK: JSON object containing the submitted data.
        - 400 Bad Request: JSON object with an error message if the session ID is not found or if the data is invalid.
    """
    session_id = request.args.get("session_id")
    form_data = request.json

    if session_id not in session_store:
        return jsonify({"error": "Session ID not found"}), 404
    if not form_data:
        return jsonify({"error": "Form data is required"}), 400

    # Store the form data in the session store
    data_store[session_id] = form_data
    return jsonify(form_data), 200


# TODO:
@app.route("/api/gpt_helper", methods=["GET"])
def get_gpt_helper():
    """
    Retrieves gpt-4.1-nano's response to help the user answer their question.

    Parameters:
        session_id (str): The unique identifier for the session, passed as a query parameter.
        current_question (str): The current question to be answered, passed as a query parameter.

    Returns:
        - 200 ok: A JSON response containing the gpt-4.1-nano's response
        - 400 bad request: A JSON response with an error message if the current question is not provided.
        - 404 not found: A JSON response with an error message if the session ID is not found.
    """

    # check if session_id is in session store
    session_id = request.args.get("session_id")
    user_question = request.args.get("current_question")

    if not user_question:
        return jsonify({"error": "Current question is required"}), 400
    if session_id not in session_store:
        return jsonify({"error": "Session ID not found"}), 404

    user_question = user_question[:USER_QUESTION_LIMIT]

    # Process GPT-4.1-nano's response here
    # For now, we will just return a dummy response

    return "I am gpt-4.1-nano, how can I help you?", 200


if __name__ == "__main__":
    app.run(debug=True)
