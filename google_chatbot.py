import modal
import json
import os
from functools import wraps
from fastapi.responses import JSONResponse

app = modal.App("google-oauth-chatbot")

image = modal.Image.debian_slim().pip_install(
    "groq",
    "google-auth",
    "requests",
    "fastapi"
)
volume = modal.Volume.from_name("chatbot-conversations", create_if_missing=True)

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
}

def cors_headers(func):
    @wraps(func)
    def wrapper(data: dict):
        # This handles the browser's pre-flight check
        if data.get("is_preflight"):
            return JSONResponse(content={"status": "ok"}, headers=CORS_HEADERS)
        response = func(data)
        if isinstance(response, JSONResponse):
            response.headers.update(CORS_HEADERS)
            return response
        else:
            return JSONResponse(content=response, headers=CORS_HEADERS)
    return wrapper

CONVERSATION_FLOW = [
    {"id": "projectType", "question": "To start, what kind of project are you working on? Your answer will help name this project intake.", "replies": {"default": "Awesome choice! That's super exciting!"}},
    {"id": "niche", "question": "What's your niche or industry? (e.g., 'Vegan cooking'). This will be used as the project name.", "replies": {"default": "That's a fascinating niche!"}},
    {"id": "targetAudience", "question": "Who is your target audience?", "replies": {"default": "Perfect! Understanding your audience is key."}},
    {"id": "contentTypes", "question": "What type of content do you create?", "replies": {"default": "Excellent content strategy!"}},
    {"id": "primaryGoal", "question": "What is your primary goal?", "replies": {"default": "That's a solid goal!"}},
    {"id": "brandVoice", "question": "What is your brand's voice?", "replies": {"default": "Great voice choice!"}},
    {"id": "language", "question": "Finally, what language is your content in?", "replies": {"default": "Perfect!"}}
]
INTAKE_KEYS = [step['id'] for step in CONVERSATION_FLOW]

@app.function(
    image=image,
    secrets=[modal.Secret.from_name("GOOGLE_CLIENT_ID")],
    volumes={"/data": volume},
)
@modal.web_endpoint(method="POST", label="get-projects")
@cors_headers
def get_projects(data: dict):
    from google.oauth2 import id_token
    from google.auth.transport import requests
    google_token = data.get("token")
    if not google_token: return {"error": "Missing token"}
    try:
        id_info = id_token.verify_oauth2_token(google_token, requests.Request(), os.environ["GOOGLE_CLIENT_ID"])
        user_email = id_info["email"]
    except ValueError:
        return {"error": "Invalid token"}
    projects = []
    structured_data_dir = f"/data/structured_data/{user_email}/"
    if os.path.exists(structured_data_dir):
        for filename in os.listdir(structured_data_dir):
            if filename.endswith(".json"):
                with open(os.path.join(structured_data_dir, filename), "r") as f:
                    project_data = json.load(f)
                    project_name = project_data.get("niche") or project_data.get("projectType") or f"Project"
                    projects.append({"id": filename.split('.')[0], "name": project_name})
    return {"projects": projects}

@app.function(
    image=image,
    secrets=[
        modal.Secret.from_name("GOOGLE_CLIENT_ID"),
        modal.Secret.from_name("GROQ_API_KEY"),
    ],
    volumes={"/data": volume},
    max_containers=10,
)
@modal.web_endpoint(method="POST", label="chat")
@cors_headers
def chat(data: dict):
    from google.oauth2 import id_token
    from google.auth.transport import requests
    from groq import Groq

    google_token = data.get("token")
    user_message = data.get("message")
    project_id = data.get("projectId")
    if not all([google_token, user_message, project_id]): return {"error": "Missing params"}
    try:
        id_info = id_token.verify_oauth2_token(google_token, requests.Request(), os.environ["GOOGLE_CLIENT_ID"])
        user_email = id_info["email"]
        first_name = id_info.get("given_name", "User")
    except ValueError:
        return {"error": "Invalid token"}

    log_path = f"/data/conversations/{user_email}/{project_id}.json"
    structured_path = f"/data/structured_data/{user_email}/{project_id}.json"
    os.makedirs(os.path.dirname(log_path), exist_ok=True)
    os.makedirs(os.path.dirname(structured_path), exist_ok=True)
    
    try:
        with open(log_path, "r") as f: history = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError): history = []
    
    if user_message.lower() == "start_new_project": history = []
    history.append({"role": "user", "content": user_message})
    
    user_answers = [msg["content"] for msg in history if msg["role"] == "user"]
    current_step_index = len(user_answers)
    client = Groq(api_key=os.environ["GROQ_API_KEY"])

    if current_step_index == 1:
        system_prompt = f"You are Beacon, an assistant for RankBeacon. Greet the user, {first_name}, warmly and introduce yourself. Explain you're starting the intake process. Then, ask the first question: '{CONVERSATION_FLOW[0]['question']}'"
        chat_completion = client.chat.completions.create(messages=[{"role": "system", "content": system_prompt}], model="llama-3.1-8b-instant")
        assistant_message = chat_completion.choices[0].message.content
    elif current_step_index <= len(CONVERSATION_FLOW):
        prev_step_config = CONVERSATION_FLOW[current_step_index - 2]
        reply_text = prev_step_config['replies'].get(user_answers[-1], prev_step_config['replies']['default'])
        next_step_config = CONVERSATION_FLOW[current_step_index - 1]
        next_question = next_step_config['question']
        assistant_message = f"{reply_text} Next up: {next_question}"
    else:
        prev_step_config = CONVERSATION_FLOW[-1]
        reply_text = prev_step_config['replies'].get(user_answers[-1], prev_step_config['replies']['default'])
        structured_data = _extract_structured_data(history)
        summary_lines = [f"**{key.replace('Type', ' Type').title()}**: {value}" for key, value in structured_data.items()]
        summary_text = "\n".join(summary_lines)
        assistant_message = f"{reply_text} Thank you so much! That's everything I need. Here is a summary of your intake:\n\n{summary_text}\n\nYou can now access the RankBeacon & start optimizing your content with our tools at the following link: [https://rankbeacon.dev](https://rankbeacon.dev). If you have any questions, reach out at dorien@rankbeacon.dev. Have a great day! 👋"
        with open(structured_path, "w") as f: json.dump(structured_data, f, indent=2)

    history.append({"role": "assistant", "content": assistant_message})
    with open(log_path, "w") as f: json.dump(history, f)
    volume.commit()
    return {"reply": assistant_message}

def _extract_structured_data(history: list) -> dict:
    structured_data = {}
    user_answers = [msg["content"] for msg in history if msg["role"] == "user"]
    for i, key in enumerate(INTAKE_KEYS):
        if i < len(user_answers): structured_data[key] = user_answers[i]
        else: structured_data[key] = "N/A"
    return structured_data
