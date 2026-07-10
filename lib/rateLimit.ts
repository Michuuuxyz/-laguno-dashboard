// Rate limiting simples em memória (janela deslizante por chave).
// Nota honesta: em serverless cada instância tem a sua memória, por isso o
// limite real pode ser N × instâncias — chega perfeitamente para travar spam
// de um utilizador (as instâncias são poucas e o burst cai na mesma).

const hits = new Map<string, number[]>();

/** true = dentro do limite; false = bloqueado. */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter(t => now - t < windowMs);
  if (arr.length >= limit) { hits.set(key, arr); return false; }
  arr.push(now);
  hits.set(key, arr);
  // Limpeza ocasional para o Map não crescer para sempre
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.every(t => now - t >= windowMs)) hits.delete(k);
  }
  return true;
}

export const tooMany = { error: 'Calma — demasiados pedidos seguidos. Tenta daqui a um minuto.' };
