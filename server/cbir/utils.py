import torch
import torchvision.transforms as transforms
from PIL import Image
from torchvision.models import resnet50

device = "cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu"

model = resnet50(pretrained=True)
model.eval().to(device)

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406], 
        std=[0.229, 0.224, 0.225]
    )
])

def extract_vector(image_path: str) -> torch.Tensor:
    image = Image.open(image_path).convert("RGB")
    img_tensor = transform(image).unsqueeze(0).to(device)
    with torch.no_grad():
        features = model(img_tensor)
    return features.squeeze().cpu()
