/**
 * Shared Date/Time and Chief Guest utilities for KJIT Media Management System.
 * Timezone: Asia/Kolkata (IST).
 */

export interface ChiefGuestInfo {
  name: string;
  designation: string;
  organisation: string;
}

/**
 * Returns current ISO string in Asia/Kolkata (IST) timezone formatted for input[type="datetime-local"].
 * Format: YYYY-MM-DDTHH:mm
 */
export function getMinDateTimeISTString(referenceDate: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(referenceDate);
  let year = '', month = '', day = '', hour = '', minute = '';
  for (const part of parts) {
    if (part.type === 'year') year = part.value;
    if (part.type === 'month') month = part.value;
    if (part.type === 'day') day = part.value;
    if (part.type === 'hour') hour = part.value;
    if (part.type === 'minute') minute = part.value;
  }
  if (hour === '24') hour = '00';
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

/**
 * Validates whether a submitted date/time is in the past relative to current Asia/Kolkata (IST) time.
 * Allows a 60-second grace buffer to account for minor client/server clock skew or form filling delay.
 */
export function isPastIST(dateTimeInput: string | Date | null | undefined): boolean {
  if (!dateTimeInput) return false;

  let inputTime: number;

  if (typeof dateTimeInput === 'string') {
    const trimmed = dateTimeInput.trim();
    if (!trimmed) return false;

    // Handle datetime-local input string without offset e.g. "2026-10-06T14:30"
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(trimmed)) {
      // Append IST offset +05:30 to parse accurately as IST
      inputTime = new Date(`${trimmed}:00+05:30`).getTime();
    } else {
      inputTime = new Date(trimmed).getTime();
    }
  } else if (dateTimeInput instanceof Date) {
    inputTime = dateTimeInput.getTime();
  } else {
    return false;
  }

  if (isNaN(inputTime)) return false;

  // Allow 60 seconds buffer (60000 ms)
  const nowTime = Date.now();
  return inputTime < (nowTime - 60000);
}

/**
 * Safely parses Chief Guest info whether stored as structured JSON object or legacy plain string.
 */
export function parseChiefGuest(raw?: string | null): ChiefGuestInfo {
  if (!raw || !raw.trim()) {
    return { name: '', designation: '', organisation: '' };
  }

  const trimmed = raw.trim();

  // Try parsing JSON
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return {
          name: parsed.name || '',
          designation: parsed.designation || parsed.title || '',
          organisation: parsed.organisation || parsed.organization || parsed.company || '',
        };
      }
    } catch (e) {
      // Fall through to plain string fallback
    }
  }

  // Legacy plain string fallback
  return {
    name: trimmed,
    designation: '',
    organisation: '',
  };
}

/**
 * Formats Chief Guest info into a clean string for text-only display or reports.
 */
export function formatChiefGuest(raw?: string | null): string {
  const cg = parseChiefGuest(raw);
  if (!cg.name) return 'N/A';

  const details = [cg.designation, cg.organisation].filter(Boolean).join(', ');
  if (details) {
    return `${cg.name} (${details})`;
  }
  return cg.name;
}
