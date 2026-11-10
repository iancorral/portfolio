// Example data for the availability demo. None of this comes from the real system.
export const OPEN = 9 * 60;
export const CLOSE = 18 * 60;
export const STEP = 30;

export const booked: [number, number][] = [
  [10 * 60, 11 * 60 + 30],
  [13 * 60, 14 * 60],
  [15 * 60, 16 * 60 + 30],
];

export const sampleServices = [
  { id: 'manicure', label: 'Manicure', minutes: 60 },
  { id: 'gel', label: 'Gel nails', minutes: 90 },
  { id: 'brows', label: 'Brows', minutes: 30 },
];

export const slotStarts = Array.from({ length: (CLOSE - OPEN) / STEP }, (_, i) => OPEN + i * STEP);

export const isBooked = (start: number) => booked.some(([from, to]) => start >= from && start < to);

// A start only counts if the whole visit fits before closing without touching a booking.
export function validStarts(minutes: number) {
  if (minutes <= 0) return [];
  return slotStarts.filter(
    (start) => start + minutes <= CLOSE && !booked.some(([from, to]) => start < to && start + minutes > from),
  );
}

export function clock(minutes: number) {
  return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}`;
}
