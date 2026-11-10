// Example data for the time zone demo. None of this comes from the real system.
export const zones = [
  { city: 'Chihuahua', role: 'Teacher', tz: 'America/Chihuahua' },
  { city: 'Madrid', role: 'Student', tz: 'Europe/Madrid' },
  { city: 'New York', role: 'Student', tz: 'America/New_York' },
];

// Two Mondays either side of the 2026 clock changes in Europe and the US.
export const weeks = [
  { id: 'before', label: 'Oct 19', date: [2026, 9, 19] as const },
  { id: 'after', label: 'Nov 2', date: [2026, 10, 2] as const },
];

const CHIHUAHUA_UTC_OFFSET = 6; // Chihuahua stays on UTC-6 all year.

export function localTime(hour: number, weekId: string, tz: string) {
  const week = weeks.find((item) => item.id === weekId) ?? weeks[0]!;
  const [year, month, day] = week.date;
  const instant = new Date(Date.UTC(year, month, day, hour + CHIHUAHUA_UTC_OFFSET));
  return new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(instant);
}
