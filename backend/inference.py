import io
import os
import json
import base64

import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image
import matplotlib
matplotlib.use("Agg")          # headless backend (no display server on a server)
import matplotlib.cm as cm

from model import build_model

# ---------------------------------------------------------------------------
# paths to the artifacts downloaded from Kaggle
# ---------------------------------------------------------------------------
ARTIFACTS = os.path.join(os.path.dirname(__file__), "artifacts")
DEVICE = "cpu"

IMAGENET_MEAN = torch.tensor([0.485, 0.456, 0.406]).view(3, 1, 1)
IMAGENET_STD = torch.tensor([0.229, 0.224, 0.225]).view(3, 1, 1)

# words that don't correspond to image regions — excluded from the averaged heatmap
STOPWORDS = {"the", "is", "are", "no", "or", "and", "in", "of", "a", "an",
             "with", "without", "there", "size", ".", ",", "<unk>"}


class ReportGenerator:
    """Loads model + vocab once; reuse for every request."""

    def __init__(self):
        self.config = json.load(open(os.path.join(ARTIFACTS, "config.json")))
        vocab = json.load(open(os.path.join(ARTIFACTS, "vocab.json")))
        self.itos = vocab["itos"]
        self.sos = self.config["sos_idx"]
        self.eos = self.config["eos_idx"]
        self.pad = self.config["pad_idx"]
        self.max_len = self.config.get("max_len", 60)
        self.img_size = self.config.get("img_size", 224)

        self.model = build_model(self.config).to(DEVICE)
        state = torch.load(os.path.join(ARTIFACTS, "model.pt"), map_location=DEVICE)
        self.model.load_state_dict(state)
        self.model.eval()

    # -- image preprocessing: identical to training -------------------------
    def _preprocess(self, pil_img):
        img = pil_img.convert("L").resize((self.img_size, self.img_size))
        raw = np.asarray(img, dtype=np.uint8)                 # (224,224) for display
        t = torch.from_numpy(raw).float() / 255.0
        t = t.unsqueeze(0).repeat(3, 1, 1)                    # fake-RGB
        t = (t - IMAGENET_MEAN) / IMAGENET_STD
        return t.unsqueeze(0).to(DEVICE), raw                 # (1,3,224,224), raw

    def _ids_to_words(self, ids):
        words = []
        for i in ids:
            i = int(i)
            if i == self.eos:
                break
            if i in (self.sos, self.pad):
                continue
            words.append(self.itos[i])
        return words

    # -- build a single heatmap overlay averaged over content words ----------
    def _overlay(self, raw, words, alphas):
        # alphas: (T, 49). Average attention across content words only.
        keep = [t for t, w in enumerate(words)
                if w.strip(".,") not in STOPWORDS and t < alphas.shape[0]]
        if not keep:
            keep = list(range(min(len(words), alphas.shape[0])))
        a = alphas[keep].mean(0).reshape(1, 1, 7, 7)
        a = F.interpolate(a, size=(self.img_size, self.img_size),
                          mode="bilinear", align_corners=False).squeeze().numpy()
        a = (a - a.min()) / (a.max() - a.min() + 1e-8)

        # blend grayscale X-ray with a 'jet' colormap heatmap
        gray = np.stack([raw, raw, raw], axis=-1).astype(np.float32) / 255.0
        heat = cm.jet(a)[..., :3]                              # (H,W,3)
        blended = (0.55 * gray + 0.45 * heat)
        blended = (np.clip(blended, 0, 1) * 255).astype(np.uint8)

        buf = io.BytesIO()
        Image.fromarray(blended).save(buf, format="PNG")
        return base64.b64encode(buf.getvalue()).decode("utf-8")

    # -- public entry point --------------------------------------------------
    @torch.no_grad()
    def generate_report(self, pil_img):
        img_t, raw = self._preprocess(pil_img)
        gen_ids, alphas = self.model.generate(img_t, self.sos, self.eos, self.max_len)
        words = self._ids_to_words(gen_ids[0])
        alphas = alphas[0].cpu()                              # (T, 49)
        text = " ".join(words) if words else "(no findings generated)"
        heatmap_b64 = self._overlay(raw, words, alphas)
        return {"report": text, "heatmap": heatmap_b64}


# single shared instance (model loads once at import)
generator = ReportGenerator()