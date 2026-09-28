/**
 * Generates a 1536-dimensional normalized embedding vector.
 * If OPENAI_API_KEY is present, queries OpenAI embeddings API.
 * Otherwise, produces a deterministic pseudo-random projection vector based on word hashes.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.EMBEDDINGS_API_KEY;

  if (apiKey && apiKey !== "mock-key") {
    try {
      const res = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          authorization: `Bearer ${apiKey}`,
          "content-type": "application/json"
        },
        body: JSON.stringify({
          model: "text-embedding-3-small",
          input: text
        })
      });
      if (res.ok) {
        const json = await res.json();
        return json.data[0].embedding;
      }
    } catch (e) {
      console.warn("Embeddings API error, falling back to local deterministic embedding:", e);
    }
  }

  // Deterministic 1536-dimensional embedding based on character / word hash projections
  const dim = 1536;
  const vector = new Array(dim).fill(0);
  const words = text.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    vector[0] = 1.0;
    return vector;
  }

  for (const word of words) {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash << 5) - hash + word.charCodeAt(i);
      hash |= 0;
    }

    // Map each word to 8 indices in the vector
    for (let j = 0; j < 8; j++) {
      const idx = Math.abs((hash ^ (j * 0x9e3779b9)) % dim);
      const sign = (hash & (1 << j)) ? 1.0 : -1.0;
      vector[idx] += sign;
    }
  }

  // Normalize to unit length
  let norm = 0;
  for (let i = 0; i < dim; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);

  if (norm > 0) {
    for (let i = 0; i < dim; i++) {
      vector[i] /= norm;
    }
  }

  return vector;
}
