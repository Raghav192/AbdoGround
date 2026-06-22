import torch
import torch.nn as nn
import torchvision


class Encoder(nn.Module):
    """DenseNet-121 backbone -> (B, num_pixels, encoder_dim) feature grid."""

    def __init__(self, encoder_dim=1024):
        super().__init__()
        densenet = torchvision.models.densenet121(weights="DEFAULT")
        self.features = densenet.features
        self.encoder_dim = encoder_dim

    def forward(self, images):
        feats = self.features(images)              # (B, 1024, 7, 7)
        B, C, H, W = feats.shape
        feats = feats.permute(0, 2, 3, 1)          # (B, 7, 7, 1024)
        feats = feats.view(B, H * W, C)            # (B, 49, 1024)
        return feats


class Attention(nn.Module):
    """Additive attention: scores each image region given the decoder state."""

    def __init__(self, encoder_dim, decoder_dim, attention_dim):
        super().__init__()
        self.enc_att = nn.Linear(encoder_dim, attention_dim)
        self.dec_att = nn.Linear(decoder_dim, attention_dim)
        self.full_att = nn.Linear(attention_dim, 1)
        self.relu = nn.ReLU()
        self.softmax = nn.Softmax(dim=1)

    def forward(self, encoder_out, decoder_hidden):
        att1 = self.enc_att(encoder_out)
        att2 = self.dec_att(decoder_hidden).unsqueeze(1)
        att = self.full_att(self.relu(att1 + att2)).squeeze(2)
        alpha = self.softmax(att)
        context = (encoder_out * alpha.unsqueeze(2)).sum(1)
        return context, alpha


class DecoderWithAttention(nn.Module):
    """LSTM decoder that generates findings text, attending to image regions."""

    def __init__(self, vocab_size, embed_dim=256, decoder_dim=512,
                 encoder_dim=1024, attention_dim=256, pad_idx=0, dropout=0.5):
        super().__init__()
        self.encoder_dim = encoder_dim
        self.decoder_dim = decoder_dim
        self.vocab_size = vocab_size

        self.embedding = nn.Embedding(vocab_size, embed_dim, padding_idx=pad_idx)
        self.attention = Attention(encoder_dim, decoder_dim, attention_dim)
        self.lstm_cell = nn.LSTMCell(embed_dim + encoder_dim, decoder_dim)
        self.init_h = nn.Linear(encoder_dim, decoder_dim)
        self.init_c = nn.Linear(encoder_dim, decoder_dim)
        self.dropout = nn.Dropout(dropout)
        self.fc = nn.Linear(decoder_dim, vocab_size)

    def init_hidden_state(self, encoder_out):
        mean = encoder_out.mean(dim=1)
        return self.init_h(mean), self.init_c(mean)

    def forward(self, encoder_out, captions):
        B, max_len = captions.shape
        num_pixels = encoder_out.size(1)
        h, c = self.init_hidden_state(encoder_out)

        embeddings = self.embedding(captions)
        preds = torch.zeros(B, max_len - 1, self.vocab_size, device=captions.device)
        alphas = torch.zeros(B, max_len - 1, num_pixels, device=captions.device)

        for t in range(max_len - 1):
            context, alpha = self.attention(encoder_out, h)
            lstm_in = torch.cat([embeddings[:, t, :], context], dim=1)
            h, c = self.lstm_cell(lstm_in, (h, c))
            preds[:, t, :] = self.fc(self.dropout(h))
            alphas[:, t, :] = alpha
        return preds, alphas

    @torch.no_grad()
    def generate(self, encoder_out, sos_idx, eos_idx, max_len=60):
        B = encoder_out.size(0)
        h, c = self.init_hidden_state(encoder_out)
        prev = torch.full((B,), sos_idx, dtype=torch.long, device=encoder_out.device)
        seqs, all_alphas = [], []

        for _ in range(max_len):
            emb = self.embedding(prev)
            context, alpha = self.attention(encoder_out, h)
            lstm_in = torch.cat([emb, context], dim=1)
            h, c = self.lstm_cell(lstm_in, (h, c))
            logits = self.fc(h)
            prev = logits.argmax(dim=1)
            seqs.append(prev)
            all_alphas.append(alpha)
            if B == 1 and prev.item() == eos_idx:
                break

        seqs = torch.stack(seqs, dim=1)
        all_alphas = torch.stack(all_alphas, dim=1)
        return seqs, all_alphas


class AbdoGround(nn.Module):
    """Full model: encoder + attention decoder. Build from config.json."""

    def __init__(self, vocab_size, embed_dim=256, decoder_dim=512,
                 attention_dim=256, encoder_dim=1024, pad_idx=0):
        super().__init__()
        self.encoder = Encoder(encoder_dim=encoder_dim)
        self.decoder = DecoderWithAttention(
            vocab_size=vocab_size, embed_dim=embed_dim, decoder_dim=decoder_dim,
            encoder_dim=encoder_dim, attention_dim=attention_dim, pad_idx=pad_idx,
        )

    def forward(self, images, captions):
        encoder_out = self.encoder(images)
        return self.decoder(encoder_out, captions)

    @torch.no_grad()
    def generate(self, images, sos_idx, eos_idx, max_len=60):
        encoder_out = self.encoder(images)
        return self.decoder.generate(encoder_out, sos_idx, eos_idx, max_len)


def build_model(config):
    """Construct the model from a config dict (config.json). Use identically
    on Kaggle and on the laptop so weights load cleanly."""
    return AbdoGround(
        vocab_size=config["vocab_size"],
        pad_idx=config.get("pad_idx", 0),
    )