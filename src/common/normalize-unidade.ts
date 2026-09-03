// Intervalo Unicode das marcas diacríticas combinantes (U+0300 a U+036F) — usado pra tirar
// acento de "Telégrafo" -> "telegrafo" depois de normalize('NFD').
const COMBINING_DIACRITICS_START = 0x0300;
const COMBINING_DIACRITICS_END = 0x036f;

/**
 * Normaliza um nome de unidade pra comparação tolerante a acento/maiúscula (ex: "telegrafo",
 * "Telégrafo" e "TELÉGRAFO" viram todos "telegrafo"). Usado pra filtrar listagens do admin por
 * unidade sem depender de bater a grafia exata gravada na planilha.
 */
export function normalizeUnidade(value: string): string {
  const decomposed = value.normalize('NFD');
  let result = '';
  for (const char of decomposed) {
    const code = char.codePointAt(0) ?? 0;
    if (code < COMBINING_DIACRITICS_START || code > COMBINING_DIACRITICS_END) {
      result += char;
    }
  }
  return result.trim().toLowerCase();
}
