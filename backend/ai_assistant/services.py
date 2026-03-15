import os
import json
import requests
from typing import Generator

OLLAMA_API_URL = os.getenv("OLLAMA_API_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma3:4b")


def chat_stream(messages: list, system_prompt: str = None) -> Generator[str, None, None]:
    """
    Stream a conversation with Ollama (local LLM).
    Yields: JSON-formatted chunks with token-by-token responses
    """
    default_system = """You are a helpful AI assistant for Quovo, a project brief generation platform. 
    You help freelancers and agencies with professional communication, project planning, and business insights."""
    
    system = system_prompt or default_system
    
    # Format messages for Ollama
    formatted_messages = "\n".join([
        f"{msg['role'].title()}: {msg['content']}"
        for msg in messages
    ])
    
    prompt = f"System: {system}\n\n{formatted_messages}\n\nAssistant:"
    
    try:
        response = requests.post(
            f"{OLLAMA_API_URL}/api/generate",
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": True,
                "temperature": 0.7,
            },
            stream=True,
            timeout=300
        )
        response.raise_for_status()
        
        for line in response.iter_lines():
            if line:
                try:
                    chunk = json.loads(line)
                    content = chunk.get("response", "")
                    if content:
                        yield json.dumps({"type": "text", "content": content}) + "\n"
                except json.JSONDecodeError:
                    pass
    
    except requests.exceptions.RequestException as e:
        yield json.dumps({"type": "error", "error": f"Ollama error: {str(e)}"}) + "\n"


def analyze_brief_stream(brief_data: dict, user_question: str = None) -> Generator[str, None, None]:
    """
    Analyze a generated brief and provide insights via streaming.
    Yields: JSON-formatted analysis chunks
    """
    system_prompt = """You are an expert project manager and business consultant. 
    Analyze the provided brief and give specific, actionable insights."""
    
    brief_context = f"""
    Project Brief:
    - Title: {brief_data.get('project_title', 'N/A')}
    - Summary: {brief_data.get('summary', 'N/A')}
    - Timeline: {brief_data.get('timeline_weeks', 'N/A')} weeks
    - Revision Rounds: {brief_data.get('revision_rounds', 'N/A')}
    - Price Range: ${brief_data.get('price_estimate_min', 0)} - ${brief_data.get('price_estimate_max', 0)}
    - Deliverables: {', '.join(brief_data.get('deliverables', []))}
    - Assumptions: {', '.join(brief_data.get('assumptions', []))}
    - Out of Scope: {', '.join(brief_data.get('out_of_scope', []))}
    """
    
    question = user_question or "Provide a comprehensive analysis of this brief and suggestions for improvement."
    
    messages = [
        {
            "role": "user",
            "content": f"{brief_context}\n\n{question}"
        }
    ]
    
    yield from chat_stream(messages, system_prompt)


def price_recommendation_stream(brief_data: dict, user_context: str = None) -> Generator[str, None, None]:
    """
    Generate pricing recommendations based on brief details via streaming.
    Yields: JSON-formatted pricing suggestions
    """
    system_prompt = """You are a pricing expert for freelance and agency work.
    Analyze the project brief and provide detailed pricing recommendations with justifications."""
    
    brief_context = f"""
    Project Details:
    - Description: {brief_data.get('summary', 'N/A')}
    - Timeline: {brief_data.get('timeline_weeks', 'N/A')} weeks
    - Revision Rounds: {brief_data.get('revision_rounds', 'N/A')}
    - Current Range: ${brief_data.get('price_estimate_min', 0)} - ${brief_data.get('price_estimate_max', 0)}
    - Deliverables: {', '.join(brief_data.get('deliverables', []))}
    """
    
    context = user_context or "No additional context provided"
    
    prompt = f"""{brief_context}

Additional Context: {context}

Please provide:
1. Recommended pricing range with reasoning
2. Pricing breakdown by deliverable (if applicable)
3. Risk factors to consider
4. Upsell opportunities
5. Market comparison insights"""
    
    messages = [
        {
            "role": "user",
            "content": prompt
        }
    ]
    
    yield from chat_stream(messages, system_prompt)


def client_communication_stream(brief_data: dict, communication_need: str) -> Generator[str, None, None]:
    """
    Generate client communication templates via streaming.
    Yields: JSON-formatted communication drafts
    """
    system_prompt = """You are an expert in client communication and business writing.
    Provide professional, persuasive, and clear communication templates for freelancers and agencies."""
    
    brief_context = f"""
    Project: {brief_data.get('project_title', 'Untitled Project')}
    Description: {brief_data.get('summary', 'N/A')}
    Budget: ${brief_data.get('price_estimate_min', 0)} - ${brief_data.get('price_estimate_max', 0)}
    Timeline: {brief_data.get('timeline_weeks', 'N/A')} weeks
    """
    
    communication_prompts = {
        "proposal": "Draft a professional project proposal based on this brief",
        "kickoff_email": "Write a kickoff email to send to the client",
        "scope_clarification": "Create questions to clarify project scope with the client",
        "progress_update": "Write a professional progress update for the client",
        "change_request": "Template for handling change requests professionally",
        "closing": "Write a professional project completion email"
    }
    
    prompt = communication_prompts.get(
        communication_need,
        "Help me communicate with the client about this project"
    )
    
    messages = [
        {
            "role": "user",
            "content": f"{brief_context}\n\nRequest: {prompt}"
        }
    ]
    
    yield from chat_stream(messages, system_prompt)


def general_chat_stream(messages: list) -> Generator[str, None, None]:
    """
    Generic chat endpoint for general questions about projects, business, etc. via streaming.
    Yields: JSON-formatted responses
    """
    system_prompt = """You are a helpful business and project management AI assistant for Quovo.
    Provide practical advice for freelancers and agencies on project management, communication, and business growth."""
    
    yield from chat_stream(messages, system_prompt)


def analyze_brief_stream(brief_data: dict, user_question: str = None) -> Generator[str, None, None]:
    """
    Analyze a generated brief and provide insights.
    Yields: JSON-formatted analysis chunks
    """
    system_prompt = """You are an expert project manager and business consultant. 
    Analyze the provided brief and give specific, actionable insights."""
    
    brief_context = f"""
    Project Brief:
    - Title: {brief_data.get('project_title', 'N/A')}
    - Summary: {brief_data.get('summary', 'N/A')}
    - Timeline: {brief_data.get('timeline_weeks', 'N/A')} weeks
    - Revision Rounds: {brief_data.get('revision_rounds', 'N/A')}
    - Price Range: ${brief_data.get('price_estimate_min', 0)} - ${brief_data.get('price_estimate_max', 0)}
    - Deliverables: {', '.join(brief_data.get('deliverables', []))}
    - Assumptions: {', '.join(brief_data.get('assumptions', []))}
    - Out of Scope: {', '.join(brief_data.get('out_of_scope', []))}
    """
    
    question = user_question or "Provide a comprehensive analysis of this brief and suggestions for improvement."
    
    messages = [
        {
            "role": "user",
            "content": f"{brief_context}\n\n{question}"
        }
    ]
    
    yield from chat_stream(messages, system_prompt)


def price_recommendation_stream(brief_data: dict, user_context: str = None) -> Generator[str, None, None]:
    """
    Generate pricing recommendations based on brief details.
    Yields: JSON-formatted pricing suggestions
    """
    system_prompt = """You are a pricing expert for freelance and agency work.
    Analyze the project brief and provide detailed pricing recommendations with justifications."""
    
    brief_context = f"""
    Project Details:
    - Description: {brief_data.get('summary', 'N/A')}
    - Timeline: {brief_data.get('timeline_weeks', 'N/A')} weeks
    - Revision Rounds: {brief_data.get('revision_rounds', 'N/A')}
    - Current Range: ${brief_data.get('price_estimate_min', 0)} - ${brief_data.get('price_estimate_max', 0)}
    - Deliverables: {', '.join(brief_data.get('deliverables', []))}
    """
    
    context = user_context or "No additional context provided"
    
    prompt = f"""{brief_context}

Additional Context: {context}

Please provide:
1. Recommended pricing range with reasoning
2. Pricing breakdown by deliverable (if applicable)
3. Risk factors to consider
4. Upsell opportunities
5. Market comparison insights"""
    
    messages = [
        {
            "role": "user",
            "content": prompt
        }
    ]
    
    yield from chat_stream(messages, system_prompt)


def client_communication_stream(brief_data: dict, communication_need: str) -> Generator[str, None, None]:
    """
    Generate client communication templates and assistance.
    Yields: JSON-formatted communication drafts
    """
    system_prompt = """You are an expert in client communication and business writing.
    Provide professional, persuasive, and clear communication templates for freelancers and agencies."""
    
    brief_context = f"""
    Project: {brief_data.get('project_title', 'Untitled Project')}
    Description: {brief_data.get('summary', 'N/A')}
    Budget: ${brief_data.get('price_estimate_min', 0)} - ${brief_data.get('price_estimate_max', 0)}
    Timeline: {brief_data.get('timeline_weeks', 'N/A')} weeks
    """
    
    communication_prompts = {
        "proposal": "Draft a professional project proposal based on this brief",
        "kickoff_email": "Write a kickoff email to send to the client",
        "scope_clarification": "Create questions to clarify project scope with the client",
        "progress_update": "Write a professional progress update for the client",
        "change_request": "Template for handling change requests professionally",
        "closing": "Write a professional project completion email"
    }
    
    prompt = communication_prompts.get(
        communication_need,
        "Help me communicate with the client about this project"
    )
    
    messages = [
        {
            "role": "user",
            "content": f"{brief_context}\n\nRequest: {prompt}"
        }
    ]
    
    yield from chat_stream(messages, system_prompt)


def general_chat_stream(messages: list) -> Generator[str, None, None]:
    """
    Generic chat endpoint for general questions about projects, business, etc.
    Yields: JSON-formatted responses
    """
    system_prompt = """You are a helpful business and project management AI assistant for Quovo.
    Provide practical advice for freelancers and agencies on project management, communication, and business growth."""
    
    yield from chat_stream(messages, system_prompt)
