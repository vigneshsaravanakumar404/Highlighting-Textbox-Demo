from flask import Flask, request, jsonify
from openai import OpenAI
from Key import KEY
from uuid import uuid4
from flask_cors import CORS

# Constants
USER_QUESTION_LIMIT = 1000
MODEL = "gpt-4.1-nano"
FORM_SCHEME = {
    "tell_me_about_yourself": {
        "type": "string",
        "question": "Tell me about yourself.",
    },
    "why_this_role": {
        "type": "string",
        "question": "Why are you interested in this role?",
    },
    "strengths": {
        "type": "string",
        "question": "What are your greatest strengths?",
    },
    "weaknesses": {
        "type": "string",
        "question": "What is your biggest weakness?",
    },
    "challenging_project": {
        "type": "string",
        "question": "Describe a challenging project you worked on. What was your role and how did you overcome the challenges?",
    },
    "teamwork_experience": {
        "type": "string",
        "question": "Can you give an example of how you worked effectively within a team?",
    },
    "conflict_resolution": {
        "type": "string",
        "question": "Tell me about a time you had a conflict with a colleague. How did you resolve it?",
    },
    "aaName": {
        "type": "string",
        "question": "What is your name?",
    },
    "leadership_example": {
        "type": "string",
        "question": "Describe a time when you demonstrated leadership.",
    },
    "why_should_we_hire_you": {
        "type": "string",
        "question": "Why should we hire you?",
    },
}


client = OpenAI(api_key=KEY)
data_store = {}  # Temporary data store for form data
session_store = {}  # Dictionary to associate session IDs with openAI ChatGPT sessions
app = Flask(__name__)
CORS(app)


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

    Parameters:
        session_id (str): The unique identifier for the session, passed as a query parameter.
        form_data (dict): The form data to be submitted, passed as JSON in the request body.

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


@app.route("/api/get_form_data", methods=["GET"])
def get_form_data():
    """
    Retrieves the form data for a given session ID.

    Parameters:
        session_id (str): The unique identifier for the session, passed as a query parameter.

    Returns:
        - 200 OK: JSON object containing the form data.
        - 404 Not Found: JSON object with an error message if the session ID is not found.
        - 404 Not Found: JSON object with an error message if no data is found for the session ID.
    """
    session_id = request.args.get("session_id")

    if session_id not in data_store:
        return jsonify({"error": "Session ID not found"}), 404

    if data_store[session_id] is None:
        return jsonify({"error": "No data found for this session ID"}), 404

    return jsonify(data_store[session_id]), 200


# TODO:
@app.route("/api/gpt_helper", methods=["GET"])
def get_gpt_helper():
    """
    Retrieves gpt-4.1-nano's response to help the user answer their question.

    Parameters:
        session_id (str): The unique identifier for the session, passed as a query parameter.
        current_question (str): The current question to be answered, passed as a query parameter.
        user_question (str): The user's question, passed as a query parameter.
        first (bool): Indicates if this is the first question

    Returns:
        - 200 ok: A JSON response containing the gpt-4.1-nano's response
        - 400 bad request: A JSON response with an error message if the current question is not provided.
        - 404 not found: A JSON response with an error message if the session ID is not found.
    """

    # check if session_id is in session store
    session_id = request.args.get("session_id")
    current_question = request.args.get("current_question", "")
    user_question = request.args.get("current_question", "")
    first = request.args.get("first", "false").lower() == "true"

    if not user_question:
        return jsonify({"error": "Current question is required"}), 400
    if session_id not in session_store:
        return jsonify({"error": "Session ID not found"}), 404

    user_question = user_question[:USER_QUESTION_LIMIT]

    if first:
        prompt = f"""Give a brieft description of the field {FORM_SCHEME[current_question]['question']} 
                     and what the user should include in their answer. Be brieft and to the point. 
                     Use only plain text and no spcial formatting. like markdown or html."""
        previous_response_id = session_store[session_id]
        response = client.responses.create(model=MODEL, input=prompt)

    else:
        prompt = f"""You are a helpful assistant that will help the user fill out their job application 
                     form. Give the applicant good advice to help succeed in their application. 
                     Keep resonses moderate in size. The current field being filled out is {FORM_SCHEME[user_question]['question']}."""
        previous_response_id = session_store[session_id]
        response = client.responses.create(
            model=MODEL,
            instructions=prompt,
            input=user_question,
        )

    session_store[session_id] = response.id

    print(response.output_text)

    return response.output_text, 200


if __name__ == "__main__":
    app.run(debug=True)
