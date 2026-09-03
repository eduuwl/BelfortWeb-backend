const PT_BR_DATE = /^(\d{2})\/(\d{2})\/(\d{4})$/;

/**
 * Converte "dd/mm/aaaa" pra Date (meia-noite local). Se `value` tiver várias datas separadas por
 * vírgula (caso do Cross Training em `datasAula`, ex: "21/07/2026, 22/07/2026, 23/07/2026"), usa
 * só a primeira — é a data que importa pra ordenar o agendamento cronologicamente. Retorna `null`
 * se não conseguir parsear (campo vazio, formato inesperado).
 */
export function parsePtBrDate(value: string): Date | null {
  const first = value.split(',')[0]?.trim() ?? '';
  const match = PT_BR_DATE.exec(first);
  if (!match) return null;

  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(date.getTime()) ? null : date;
}
