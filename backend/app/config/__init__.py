"""Configuration module for application settings and templates."""

from .feedback_templates import (
    FEEDBACK_TEMPLATES,
    get_all_templates,
    get_templates_by_category,
    get_template_by_id,
    get_flattened_templates
)

__all__ = [
    "FEEDBACK_TEMPLATES",
    "get_all_templates",
    "get_templates_by_category",
    "get_template_by_id",
    "get_flattened_templates"
]
