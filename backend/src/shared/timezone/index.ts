const TIMEZONE = 'America/Sao_Paulo';

const dayOfWeekFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  timeZone: TIMEZONE,
});

const dayOfWeekMap: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: TIMEZONE,
});

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: TIMEZONE,
});

export function getDayOfWeekInBRT(date: Date): number {
  const day = dayOfWeekFormatter.format(date);
  return dayOfWeekMap[day];
}

export function formatTimeInBRT(date: Date): string {
  return timeFormatter.format(date);
}

export function formatDateInBRT(date: Date): string {
  return dateFormatter.format(date);
}
