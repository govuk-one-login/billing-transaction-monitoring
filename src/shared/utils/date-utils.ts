export function formatDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = ("0" + String(date.getUTCMonth() + 1)).slice(-2);
  const day = ("0" + String(date.getUTCDate())).slice(-2);
  return `${year}-${month}-${day}`;
}
