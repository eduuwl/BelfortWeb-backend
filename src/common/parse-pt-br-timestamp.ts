const PT_BR_TIMESTAMP =
  /^(\d{2})\/(\d{2})\/(\d{4}),?\s+(\d{2}):(\d{2}):(\d{2})$/;

/**
 * Converte o formato gravado por AppsScriptService.forward (toLocaleString('pt-BR', { timeZone:
 * 'America/Belem' }), ex: "16/07/2026, 08:03:32") para ISO 8601. America/Belem é UTC-3 fixo,
 * sem horário de verão.
 */
export function parsePtBrTimestampToIso(value: string): string {
  const match = PT_BR_TIMESTAMP.exec(value.trim());
  if (!match) return '';

  const [, day, month, year, hour, minute, second] = match;
  const utcMs = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour) + 3,
    Number(minute),
    Number(second),
  );

  if (Number.isNaN(utcMs)) return '';
  return new Date(utcMs).toISOString();
}
