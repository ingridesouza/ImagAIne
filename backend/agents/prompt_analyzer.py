import logging
import re

logger = logging.getLogger(__name__)

class PromptAnalyzerAgent:
    """An agent that analyzes and enhances user prompts using a rule-based system."""

    def __init__(self):
        logger.info("Rule-based Prompt Analyzer Agent initialized.")
        self.rules = {
            # Keywords that trigger a category
            "portrait": ["portrait", "face", "person", "man", "woman", "boy", "girl"],
            "landscape": ["landscape", "mountain", "forest", "beach", "cityscape", "sea"],
            "sci-fi": ["sci-fi", "futuristic", "robot", "cyborg", "spaceship", "alien"],
            "fantasy": ["fantasy", "dragon", "elf", "wizard", "castle", "magic"],
        }
        self.enhancements = {
            # Enhancements per category
            "portrait": ["close-up", "detailed skin texture", "sharp focus", "soft lighting"],
            "landscape": ["dramatic lighting", "wide angle", "epic scale", "atmospheric"],
            "sci-fi": ["neon lighting", "chrome details", "glowing elements", "dystopian"],
            "fantasy": ["enchanted", "mythical", "glowing runes", "epic fantasy art"],
            # Generic enhancements as a fallback
            "generic": ["masterpiece", "best quality", "ultra-detailed", "4k"],
        }

    def _detect_category(self, prompt: str) -> str:
        """Detects the category of the prompt based on keywords."""
        prompt_lower = prompt.lower()
        for category, keywords in self.rules.items():
            if any(re.search(r'\b' + keyword + r'\b', prompt_lower) for keyword in keywords):
                logger.info(f"Detected category: {category}")
                return category
        logger.info("No specific category detected, using generic enhancements.")
        return "generic"

    def enhance_prompt(self, prompt: str) -> str:
        """
        Enhances the user's prompt by adding descriptive keywords based on detected category.
        """
        logger.info(f"Original prompt: '{prompt}'")
        
        category = self._detect_category(prompt)
        
        keywords_to_add = self.enhancements[category][:] # Create a copy
        
        # Also add generic keywords for specific categories for a general quality boost
        if category != "generic":
            keywords_to_add.extend(self.enhancements["generic"])

        enhanced_prompt = prompt
        # Use a set to ensure no duplicate keywords are added
        for keyword in set(keywords_to_add):
            if keyword not in enhanced_prompt.lower():
                enhanced_prompt += f", {keyword}"

        logger.info(f"Enhanced prompt: '{enhanced_prompt}'")
        return enhanced_prompt
