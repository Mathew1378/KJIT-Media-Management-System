/**
 * Shared Date/Time and Chief Guest utilities for KJIT Media Management System.
 * Timezone: Asia/Kolkata (IST, UTC+05:30).
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
 * Accurately parses a datetime input into a Date object representing the given time in Asia/Kolkata (IST, UTC+05:30).
 * Handles HTML5 datetime-local formats ("YYYY-MM-DDTHH:mm", "YYYY-MM-DDTHH:mm:ss"), strings with spaces ("YYYY-MM-DD HH:mm"),
 * DD-MM-YYYY formats, and ISO strings with timezone offsets.
 */
export function parseDateTimeIST(dateTimeInput: string | Date | null | undefined): Date | null {
  if (!dateTimeInput) return null;

  if (dateTimeInput instanceof Date) {
    return isNaN(dateTimeInput.getTime()) ? null : new Date(dateTimeInput.getTime());
  }

  if (typeof dateTimeInput !== 'string') return null;

  const trimmed = dateTimeInput.trim();
  if (!trimmed) return null;

  // 1. Check for standard YYYY-MM-DD[T or space]HH:mm(:ss)?
  const ymdMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2}))?(?:\.(\d+))?(.*)$/);
  if (ymdMatch) {
    const [, year, month, day, hour, minute, second = '00', ms, offsetPart] = ymdMatch;
    const trimmedOffset = offsetPart ? offsetPart.trim() : '';
    if (trimmedOffset === 'Z' || /^[+-]\d{2}:?\d{2}$/.test(trimmedOffset)) {
      const parsed = new Date(trimmed);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    const msPart = ms ? `.${ms.slice(0, 3)}` : '';
    const istIso = `${year}-${month}-${day}T${hour}:${minute}:${second}${msPart}+05:30`;
    const parsed = new Date(istIso);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  // 2. Check for DD-MM-YYYY or DD/MM/YYYY with time
  const dmyMatch = trimmed.match(/^(\d{2})[-/](\d{2})[-/](\d{4})[T\s](\d{2}):(\d{2})(?::(\d{2}))?(.*)$/);
  if (dmyMatch) {
    const [, day, month, year, hour, minute, second = '00'] = dmyMatch;
    const istIso = `${year}-${month}-${day}T${hour}:${minute}:${second}+05:30`;
    const parsed = new Date(istIso);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  // 3. Fallback: direct Date constructor
  const fallback = new Date(trimmed);
  return isNaN(fallback.getTime()) ? null : fallback;
}

/**
 * Validates whether a submitted date/time is in the past relative to current Asia/Kolkata (IST) time.
 * Allows a 60-second grace buffer to account for minor client/server clock skew or form filling delay.
 */
export function isPastIST(dateTimeInput: string | Date | null | undefined): boolean {
  if (!dateTimeInput) return false;

  const parsed = parseDateTimeIST(dateTimeInput);
  if (!parsed || isNaN(parsed.getTime())) return false;

  const inputTime = parsed.getTime();
  const nowTime = Date.now();
  return inputTime < (nowTime - 60000);
}

/**
 * Returns the calendar date string in "YYYY-MM-DD" format for Asia/Kolkata (IST, UTC+05:30).
 */
export function getISTDateOnlyString(dateTimeInput: string | Date | null | undefined): string | null {
  if (!dateTimeInput) return null;

  const parsed = parseDateTimeIST(dateTimeInput);
  if (!parsed || isNaN(parsed.getTime())) return null;

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(parsed);
}

/**
 * Validates whether the media submission deadline date is earlier than the event date in Asia/Kolkata (IST).
 * Allows the deadline to be on the same calendar day as the event or any subsequent day.
 * Returns true if the deadline date is strictly earlier than the event date (i.e. invalid).
 */
export function isDeadlineEarlierThanEventDate(
  eventDateInput: string | Date | null | undefined,
  deadlineInput: string | Date | null | undefined
): boolean {
  const eventDateStr = getISTDateOnlyString(eventDateInput);
  const deadlineDateStr = getISTDateOnlyString(deadlineInput);

  if (!eventDateStr || !deadlineDateStr) return false;
  return deadlineDateStr < eventDateStr;
}

/**
 * Validates whether the media submission deadline is earlier than the event date & time in Asia/Kolkata (IST).
 * Compares full date and time down to minute/millisecond precision.
 * Returns true if the deadline is strictly earlier than the event date & time (i.e. invalid).
 * Returns false if the deadline is equal to or later than the event date & time (i.e. valid).
 */
export function isDeadlineEarlierThanEventDateTime(
  eventDateInput: string | Date | null | undefined,
  deadlineInput: string | Date | null | undefined
): boolean {
  const eventDate = parseDateTimeIST(eventDateInput);
  const deadlineDate = parseDateTimeIST(deadlineInput);

  if (!eventDate || !deadlineDate) return false;
  return deadlineDate.getTime() < eventDate.getTime();
}

/**
 * Formats a date/time into a human-friendly IST string for display, e.g. "30 Nov 2026, 3:06 pm".
 */
export function formatDateTimeDisplayIST(dateTimeInput: string | Date | null | undefined): string | null {
  if (!dateTimeInput) return null;
  const parsed = parseDateTimeIST(dateTimeInput);
  if (!parsed || isNaN(parsed.getTime())) return null;

  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(parsed);
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
