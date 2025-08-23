import logging
import numpy as np
from PIL import Image, ImageStat, ImageFilter

logger = logging.getLogger(__name__)

class CriticAgent:
    """An agent that validates the quality of a generated image."""

    def __init__(self, blur_threshold=100.0, solid_color_threshold=1.0):
        """
        Initializes the Critic Agent.

        Args:
            blur_threshold: The variance of the Laplacian threshold. Images with a value
                            below this will be considered blurry.
            solid_color_threshold: The standard deviation threshold for detecting solid
                                   color images. Below this, it's likely a single color.
        """
        self.blur_threshold = blur_threshold
        self.solid_color_threshold = solid_color_threshold
        logger.info(f"Critic Agent initialized with blur_threshold={blur_threshold} and solid_color_threshold={solid_color_threshold}")

    def validate_image(self, image_path: str) -> bool:
        """ 
        Validates an image based on a set of quality criteria.

        Args:
            image_path: The path to the image file.

        Returns:
            True if the image is valid, False otherwise.
        """
        try:
            with Image.open(image_path) as img:
                # 1. Check for solid color images (e.g., all black)
                extrema = img.convert("L").getextrema()
                if (extrema[1] - extrema[0]) <= self.solid_color_threshold:
                    logger.warning(f"Validation FAILED for {image_path}: Image is a solid color.")
                    return False

                # 2. Check for blurriness using Laplacian variance
                # Use a kernel for the Laplacian filter to avoid version issues
                laplace_kernel = ImageFilter.Kernel(
                    (3, 3),
                    (0, 1, 0, 1, -4, 1, 0, 1, 0),
                    scale=1,
                    offset=0
                )
                laplacian_var = img.convert("L").filter(laplace_kernel).var()
                if laplacian_var < self.blur_threshold:
                    logger.warning(f"Validation FAILED for {image_path}: Image is too blurry (Laplacian variance: {laplacian_var:.2f}).")
                    return False

        except Exception as e:
            logger.error(f"Error validating image {image_path}: {e}", exc_info=True)
            return False # Fail validation if any error occurs

        logger.info(f"Validation PASSED for {image_path}.")
        return True
