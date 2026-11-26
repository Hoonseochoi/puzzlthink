"""Embed the vocabulary with one or more sentence-embedding models, for comparing models (eval_models.py)
and for the build (embed.py reads the chosen one).

Usage: embed_models.py <data> [--reuse <old data>] <name> [<name> ...]     names are keys of MODELS below
Output: <data>/emb/<name>.npy  (float16, L2-normalised, same order as vocab.txt)
--reuse: words already embedded in <old data> (its vocab.txt and emb/<name>.npy, or bge.npy for bge-m3) keep
         those exact vectors; only new words are embedded. A rebuild with more words then leaves every old
         number as it was.

A single word is a very short text: instruction-tuned models get the same instruction on both sides
(target and hint are embedded alike, so the similarity is symmetric).
"""
import os, sys, time
import numpy as np
from sentence_transformers import SentenceTransformer

INSTR = 'Instruct: Given a Korean word, represent its meanings so that words associated with it are close\nQuery: '
# name: (Hugging Face id, licence, prefix added to every word, extra kwargs)
MODELS = {
    'bge-m3':        ('BAAI/bge-m3', 'MIT', '', {}),
    'kure-v1':       ('nlpai-lab/KURE-v1', 'MIT', '', {}),
    'bge-m3-ko':     ('dragonkue/BGE-m3-ko', 'Apache-2.0', '', {}),
    'kure-v2':       ('nlpai-lab/KURE-v2', 'Apache-2.0', '', {}),
    'qwen3-0.6b':    ('Qwen/Qwen3-Embedding-0.6B', 'Apache-2.0', INSTR, {}),
    'qwen3-0.6b-raw':('Qwen/Qwen3-Embedding-0.6B', 'Apache-2.0', '', {}),
    'qwen3-4b':      ('Qwen/Qwen3-Embedding-4B', 'Apache-2.0', INSTR, {}),
    'me5-large-i':   ('intfloat/multilingual-e5-large-instruct', 'MIT', INSTR, {}),
    'arctic-l-v2':   ('Snowflake/snowflake-arctic-embed-l-v2.0', 'Apache-2.0', 'query: ', {}),
}

if __name__ == '__main__':
    DATA = sys.argv[1]; args = sys.argv[2:]; OLD = None
    if args[:1] == ['--reuse']: OLD, args = args[1], args[2:]
    words = open(f'{DATA}/vocab.txt', encoding='utf-8').read().split()
    os.makedirs(f'{DATA}/emb', exist_ok=True)
    for name in args:
        hf, lic, prefix, kw = MODELS[name]
        out = f'{DATA}/emb/{name}.npy'
        if os.path.exists(out): print(name, 'exists'); continue
        t = time.time()
        known = {}
        if OLD:
            old_path = f'{OLD}/emb/{name}.npy' if os.path.exists(f'{OLD}/emb/{name}.npy') else (f'{OLD}/bge.npy' if name == 'bge-m3' else None)
            if old_path and os.path.exists(old_path):
                old_words = open(f'{OLD}/vocab.txt', encoding='utf-8').read().split(); OV = np.load(old_path)
                assert OV.shape[0] == len(old_words), old_path
                known = {w: OV[i] for i, w in enumerate(old_words)}
        todo = [w for w in words if w not in known]
        V = np.zeros((len(words), 0), np.float16)
        if todo:
            m = SentenceTransformer(hf, device='mps', **kw); m.half()
            bs = 64 if '4b' in name else 256
            N = m.encode([prefix + w for w in todo], batch_size=bs, normalize_embeddings=True, convert_to_numpy=True, show_progress_bar=False).astype(np.float16)
            new = dict(zip(todo, N)); del m
        else:
            new = {}
        V = np.stack([known[w] if w in known else new[w] for w in words]).astype(np.float16)
        np.save(out, V)
        print(f'{name}: reused {len(words) - len(todo)}, embedded {len(todo)}', flush=True)
        print(f'{name} ({hf}, {lic}): {len(words)} words, dim {V.shape[1]}, {time.time() - t:.0f}s', flush=True)
