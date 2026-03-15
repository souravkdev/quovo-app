import json
import os
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_brief(client_message: str, freelancer_type: str, hourly_rate: int, extra_context: str = ""):
    """
    Generate a structured project brief using OpenAI GPT-4o with JSON mode.
    
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

Return ONLY valid JSON, no additional text."""

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            response_format={"type": "json_object"},
            temperature=0.7,
            max_tokens=2000,
        )
    except Exception as e:
        # Fallback to gpt-4-turbo if gpt-4o fails
        try:
            response = client.chat.completions.create(
                model="gpt-4-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                response_format={"type": "json_object"},
                temperature=0.7,
                max_tokens=2000,
            )
        except Exception:
            # If JSON mode fails, try without it
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                temperature=0.7,
                max_tokens=2000,
            )
    
    # Extract and parse the JSON response
    response_text = response.choices[0].message.content
    
    try:
        brief_data = json.loads(response_text)
    except json.JSONDecodeError:
        # If JSON parsing fails, try to extract JSON from the response
        import re
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            brief_data = json.loads(json_match.group())
        else:
            raise ValueError("Failed to parse OpenAI response as JSON")
    
    return brief_data
