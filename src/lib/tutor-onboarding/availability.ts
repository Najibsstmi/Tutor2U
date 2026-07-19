export type AvailabilitySlotLike = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone?: string;
  active?: boolean;
};

export function timeToMinutes(value: string) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);

  if (!match) {
    return Number.NaN;
  }

  return Number(match[1]) * 60 + Number(match[2]);
}

export function hasValidTimeRange(slot: AvailabilitySlotLike) {
  return timeToMinutes(slot.startTime) < timeToMinutes(slot.endTime);
}

export function availabilitySlotsOverlap(first: AvailabilitySlotLike, second: AvailabilitySlotLike) {
  if (first.active === false || second.active === false) {
    return false;
  }

  if (first.dayOfWeek !== second.dayOfWeek) {
    return false;
  }

  const firstStart = timeToMinutes(first.startTime);
  const firstEnd = timeToMinutes(first.endTime);
  const secondStart = timeToMinutes(second.startTime);
  const secondEnd = timeToMinutes(second.endTime);

  if ([firstStart, firstEnd, secondStart, secondEnd].some(Number.isNaN)) {
    return true;
  }

  return firstStart < secondEnd && secondStart < firstEnd;
}

export function findOverlappingAvailability(slots: AvailabilitySlotLike[]) {
  const overlaps: Array<[number, number]> = [];

  for (let i = 0; i < slots.length; i += 1) {
    for (let j = i + 1; j < slots.length; j += 1) {
      if (availabilitySlotsOverlap(slots[i], slots[j])) {
        overlaps.push([i, j]);
      }
    }
  }

  return overlaps;
}
