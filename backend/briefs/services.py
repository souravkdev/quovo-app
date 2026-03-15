import json
import os
import re
import requests

OLLAMA_API_URL = os.getenv("OLLAMA_API_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen3-coder:30b")

def generate_brief(client_message: str, freelancer_type: str, hourly_rate: int, extra_context: str = ""):
    """
    Generate a structured project brief using local Ollama (Qwen model).
    
    Args:
        client_message: The raw client message/request
        freelancer_type: Type of freelancer (e.g., "web developer", "designer")
        hourly_rate: Freelancer's hourly rate
        extra_context: Additional context about the project
    
    Returns:
        dict: Structured brief with fields like project_title, summary, deliverables, etc.
    """
    
    system_prompt = """You are an expert project brief generator for freelancers. 
Your job is to take a messy client message and transform it into a clear, professional project brief.
Always output valid JSON with the exact structure requested."""

    user_message = f"""Please generate a professional project brief based on this information:

Client Message: {client_message}

Freelancer Type: {freelancer_type}
Hourly Rate: ${hourly_rate}/hour
Extra Context: {extra_context if extra_context else "None provided"}

Generate a detailed, professional brief in JSON format with the following structure:
{{
    "project_title": "Clear, concise project title",
    "summary": "1-2 sentence summary of what the project is about",
    "deliverables": ["list of specific deliverables"],
    "timeline_weeks": integer number of weeks,
    "revision_rounds": integer number of included revision rounds,
    "price_estimate_min": integer minimum price in dollars,
    "price_estimate_max": integer maximum price in dollars,
    "assumptions": ["list of key assumptions about the project"],
    "out_of_scope": ["list of things not included in the project"],
    "next_steps": ["list of action items for the client"]
}}

Make sure:
- Deliverables are specific and measurable
- Timeline is realistic based on freelancer type and scope
- Price estimates are reasonable based on hourly rate and timeline
- Assumptions clarify any ambiguous parts of the client message
- Out of scope items prevent scope creep
- Next steps are clear action items for the client

Return ONLY valid JSON, no additional text or markdown code blocks."""

    try:
        response = requests.post(
            f"{OLLAMA_API_URL}/api/generate",
            json={
                "model": OLLAMA_MODEL,
                "prompt": f"System: {system_prompt}\n\nUser: {user_message}",
                "stream": False,
                "temperature": 0.7,
            },
            timeout=300
        )
        response.raise_for_status()
        
        response_data = response.json()
        response_text = response_data.get("response", "")
        
        try:
            brief_data = json.loads(response_text)
        except json.JSONDecodeError:
            # If JSON parsing fails, try to extract JSON from markdown code blocks
            json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', response_text, re.DOTALL)
            if json_match:
                brief_data = json.loads(json_match.group(1))
            else:
                # Try to extract raw JSON object
                json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
                if json_match:
                    brief_data = json.loads(json_match.group())
                else:
                    raise ValueError(f"Failed to parse Ollama response as JSON: {response_text}")
        
        return brief_data
    
    except requests.exceptions.ConnectTimeout:
        raise Exception(f"Failed to connect to Ollama at {OLLAMA_API_URL}. Make sure Ollama is running.")
    except requests.exceptions.RequestException as e:
        raise Exception(f"Ollama API error: {str(e)}")
    except Exception as e:
        raise Exception(f"Brief generation error: {str(e)}")
