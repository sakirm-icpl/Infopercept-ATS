"""
Feedback comment templates for stage evaluations.

These templates provide predefined comment structures for common evaluation scenarios,
helping team members provide consistent and comprehensive feedback efficiently.
"""

FEEDBACK_TEMPLATES = {
    "strong_candidate": {
        "category": "Strong Candidate",
        "templates": [
            {
                "id": "strong_technical",
                "name": "Strong Technical Skills",
                "content": "The candidate demonstrated excellent technical skills during the interview. They showed strong problem-solving abilities, clear communication, and a deep understanding of the required technologies. Their approach to the technical challenges was methodical and well-structured. I recommend moving forward with this candidate."
            },
            {
                "id": "strong_cultural_fit",
                "name": "Excellent Cultural Fit",
                "content": "The candidate exhibited outstanding alignment with our company values and culture. They demonstrated strong teamwork skills, excellent communication abilities, and a positive attitude. Their experience and approach to work align well with our team dynamics. I highly recommend this candidate for the next stage."
            },
            {
                "id": "strong_leadership",
                "name": "Strong Leadership Potential",
                "content": "The candidate showed impressive leadership qualities and strategic thinking. They articulated clear vision, demonstrated experience in managing teams, and showed excellent decision-making skills. Their past achievements and approach to challenges indicate strong potential for leadership roles. I strongly recommend advancing this candidate."
            },
            {
                "id": "strong_overall",
                "name": "Outstanding Overall Performance",
                "content": "The candidate exceeded expectations across all evaluation criteria. They demonstrated exceptional technical competence, excellent communication skills, strong cultural alignment, and impressive problem-solving abilities. Their qualifications and performance make them an ideal fit for this position. I highly recommend proceeding to the next stage."
            }
        ]
    },
    "needs_improvement": {
        "category": "Needs Improvement",
        "templates": [
            {
                "id": "technical_gaps",
                "name": "Technical Skills Need Development",
                "content": "The candidate showed potential but has noticeable gaps in technical skills required for this role. While they demonstrated basic understanding, they struggled with more complex problems and lacked depth in key areas. With additional training and experience, they could be a good fit. I recommend proceeding with caution or considering for a junior position."
            },
            {
                "id": "communication_concerns",
                "name": "Communication Skills Need Improvement",
                "content": "The candidate has relevant technical skills but needs to improve their communication abilities. They had difficulty articulating their thoughts clearly and explaining technical concepts. This could impact their effectiveness in a collaborative environment. I recommend additional evaluation or considering for roles with less communication requirements."
            },
            {
                "id": "experience_limited",
                "name": "Limited Relevant Experience",
                "content": "The candidate shows enthusiasm and willingness to learn but lacks sufficient relevant experience for this role. While they have foundational knowledge, they would require significant onboarding and mentoring. I recommend considering them for a more junior position or providing additional training opportunities."
            },
            {
                "id": "mixed_performance",
                "name": "Mixed Performance",
                "content": "The candidate demonstrated strengths in some areas but showed weaknesses in others. While they have potential, there are concerns about their readiness for this specific role. I recommend further evaluation in the next stage to better assess their overall fit and capabilities."
            }
        ]
    },
    "not_suitable": {
        "category": "Not Suitable",
        "templates": [
            {
                "id": "insufficient_skills",
                "name": "Insufficient Technical Skills",
                "content": "The candidate does not meet the minimum technical requirements for this position. They demonstrated significant gaps in essential skills and struggled with fundamental concepts. Their current skill level does not align with the role's requirements. I do not recommend moving forward with this candidate at this time."
            },
            {
                "id": "poor_cultural_fit",
                "name": "Poor Cultural Alignment",
                "content": "While the candidate may have relevant technical skills, they do not align well with our company culture and values. Their approach to work, communication style, and professional demeanor raised concerns about their fit within our team. I do not recommend proceeding with this candidate."
            },
            {
                "id": "unprepared",
                "name": "Inadequate Preparation",
                "content": "The candidate appeared unprepared for the interview and lacked basic knowledge about our company and the role. They were unable to answer fundamental questions and did not demonstrate genuine interest in the position. I do not recommend advancing this candidate to the next stage."
            },
            {
                "id": "not_recommended",
                "name": "Not Recommended",
                "content": "After careful evaluation, I do not recommend this candidate for the position. They did not meet the required standards across multiple evaluation criteria including technical skills, communication abilities, and cultural fit. I suggest we continue our search for more suitable candidates."
            }
        ]
    },
    "neutral": {
        "category": "Neutral/General",
        "templates": [
            {
                "id": "standard_evaluation",
                "name": "Standard Evaluation",
                "content": "The candidate completed the interview stage. They demonstrated adequate understanding of the role requirements and answered questions satisfactorily. Based on this evaluation, I recommend proceeding to the next stage for further assessment."
            },
            {
                "id": "requires_discussion",
                "name": "Requires Team Discussion",
                "content": "The candidate presents an interesting profile with both strengths and areas of concern. I believe this case warrants team discussion before making a final decision. I recommend scheduling a debrief to align on the evaluation and next steps."
            }
        ]
    }
}


def get_all_templates():
    """
    Get all feedback templates organized by category.
    
    Returns:
        dict: Dictionary of templates organized by category
    """
    return FEEDBACK_TEMPLATES


def get_templates_by_category(category: str):
    """
    Get templates for a specific category.
    
    Args:
        category: Category key (strong_candidate, needs_improvement, not_suitable, neutral)
        
    Returns:
        dict: Templates for the specified category or None if not found
    """
    return FEEDBACK_TEMPLATES.get(category)


def get_template_by_id(template_id: str):
    """
    Get a specific template by its ID.
    
    Args:
        template_id: Unique template identifier
        
    Returns:
        dict: Template data or None if not found
    """
    for category_data in FEEDBACK_TEMPLATES.values():
        for template in category_data.get("templates", []):
            if template["id"] == template_id:
                return template
    return None


def get_flattened_templates():
    """
    Get all templates in a flat list format for easy API consumption.
    
    Returns:
        list: List of all templates with category information
    """
    flattened = []
    for category_key, category_data in FEEDBACK_TEMPLATES.items():
        category_name = category_data["category"]
        for template in category_data["templates"]:
            flattened.append({
                **template,
                "category_key": category_key,
                "category_name": category_name
            })
    return flattened
