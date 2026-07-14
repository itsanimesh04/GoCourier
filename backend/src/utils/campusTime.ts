import { env } from '../config/env';

const timeFormatterCache = new Map<string, Intl.DateTimeFormat>();
const dateFormatterCache = new Map<string, Intl.DateTimeFormat>();

function timeFormatter(timeZone: string) {
  const cached = timeFormatterCache.get(timeZone);

  if (cached) {
    return cached;
  }

  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hourCycle: 'h23',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  timeFormatterCache.set(timeZone, formatter);
  return formatter;
}

function dateFormatter(timeZone: string) {
  const cached = dateFormatterCache.get(timeZone);

  if (cached) {
    return cached;
  }

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  dateFormatterCache.set(timeZone, formatter);
  return formatter;
}

function partValue(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes) {
  return parts.find((part) => part.type === type)?.value ?? '00';
}

export function localDateString(date = new Date(), timeZone = env.APP_TIME_ZONE) {
  const parts = dateFormatter(timeZone).formatToParts(date);
  return `${partValue(parts, 'year')}-${partValue(parts, 'month')}-${partValue(parts, 'day')}`;
}

export function localTimeSeconds(date = new Date(), timeZone = env.APP_TIME_ZONE) {
  const parts = timeFormatter(timeZone).formatToParts(date);
  const hour = Number(partValue(parts, 'hour'));
  const minute = Number(partValue(parts, 'minute'));
  const second = Number(partValue(parts, 'second'));
  return hour * 3600 + minute * 60 + second;
}

export function timeStringToSeconds(time: string) {
  const [hour = '0', minute = '0', second = '0'] = time.split(':');
  return Number(hour) * 3600 + Number(minute) * 60 + Number(second);
}

export function isCutoffPassed(cutoffTime: string, date = new Date(), timeZone = env.APP_TIME_ZONE) {
  return localTimeSeconds(date, timeZone) >= timeStringToSeconds(cutoffTime);
}
