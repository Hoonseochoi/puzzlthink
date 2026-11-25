"""Step 2: bge-m3 vectors for the vocabulary + the blend weights.

Output: data/bge.npy  (float16, L2-normalised, same order as vocab.txt)
        data/blend.json  {mu_ft, sd_ft, mu_bge, sd_bge, w_ft, w_bge}
Blend score of (a, b) = w_ft * (cos_ft - mu_ft)/sd_ft + w_bge * (cos_bge - mu_bge)/sd_bge
"""
import json, sys, time
import numpy as np
from sentence_transformers import SentenceTransformer

DATA = sys.argv[1] if len(sys.argv) > 1 else 'data'
W_BGE = 0.6
words = open(f'{DATA}/vocab.txt').read().split()
t = time.time()
m = SentenceTransformer('BAAI/bge-m3', device='mps'); m.half()
B = m.encode(words, batch_size=512, normalize_embeddings=True, convert_to_numpy=True, show_progress_bar=False)
print(f'bge-m3: {len(words)} words in {time.time()-t:.0f}s')
np.save(f'{DATA}/bge.npy', B.astype(np.float16))
F = np.load(f'{DATA}/ft.npy').astype(np.float32); B = B.astype(np.float32)
ref = json.load(open(f'{DATA}/vocab.json'))['ref']   # stats over the clean reference nouns
rng = np.random.default_rng(0); i = rng.integers(0, ref, 4000); j = rng.integers(0, ref, 4000)
cf = (F[i] * F[j]).sum(1); cb = (B[i] * B[j]).sum(1)
stats = dict(mu_ft=float(cf.mean()), sd_ft=float(cf.std()), mu_bge=float(cb.mean()), sd_bge=float(cb.std()), w_ft=1 - W_BGE, w_bge=W_BGE)
json.dump(stats, open(f'{DATA}/blend.json', 'w'), indent=1); print(stats)
