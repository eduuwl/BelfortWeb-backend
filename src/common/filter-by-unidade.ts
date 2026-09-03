import { normalizeUnidade } from './normalize-unidade';

/**
 * Filtra uma listagem pelo campo `unidade`, tolerante a acento/maiúscula (ver normalizeUnidade).
 * `unidade` ausente/vazio significa "sem filtro" — devolve a lista inteira. Precisa ser aplicado
 * ANTES de paginar, senão cada página fica filtrada só dentro de si mesma.
 *
 * Recebe `getUnidade` em vez de assumir `record.unidade` direto: `AppsScriptRecord` (usado por
 * Matrícula/Avaliação Física/Avaliação Nutricional) só tem `unidade` via assinatura de índice
 * (`Record<string, string>`), e isso não satisfaz um constraint genérico `T extends { unidade:
 * string }` no TypeScript — daria erro de compilação nesses três call sites mesmo sendo válido
 * em runtime. Passar o getter evita depender de um shape específico.
 */
export function filterByUnidade<T>(
  records: T[],
  unidade: string | undefined,
  getUnidade: (record: T) => string,
): T[] {
  if (!unidade) return records;
  const target = normalizeUnidade(unidade);
  return records.filter(
    (record) => normalizeUnidade(getUnidade(record)) === target,
  );
}
