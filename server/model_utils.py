from diffusers import StableDiffusionPipeline
import torch
from PIL import Image
import os
import uuid

# Determine the available device
if torch.backends.mps.is_available():
    device = "mps"
elif torch.cuda.is_available():
    device = "cuda"
else:
    device = "cpu"

# Load the Stable Diffusion model
pipe = StableDiffusionPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    torch_dtype=torch.float16 if device != "cpu" else torch.float32
)
pipe = pipe.to(device)

# Function to generate image and save it to the given output path
def generate_image(prompt: str, output_path: str):
    image = pipe(prompt).images[0]
    image.save(output_path)
