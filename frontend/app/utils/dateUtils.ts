import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import updateLocale from 'dayjs/plugin/updateLocale';

// Initialize dayjs plugins
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);
dayjs.extend(updateLocale);

// Set locale configurations if needed
dayjs.updateLocale('en', {
  relativeTime: {
    future: "in %s",
    past: "%s ago",
    s: 'a few seconds',
    m: "a minute",
    mm: "%d minutes",
    h: "an hour",
    hh: "%d hours",
    d: "a day",
    dd: "%d days",
    M: "a month",
    MM: "%d months",
    y: "a year",
    yy: "%d years"
  }
});

// Format a date in a consistent way
export const formatDate = (date: string | Date) => {
  return dayjs(date).format('ll'); // Jan 15, 2022
};

// Format a date with time
export const formatDateTime = (date: string | Date) => {
  return dayjs(date).format('lll'); // Jan 15, 2022 12:34 PM
};

// Get relative time (e.g., "2 hours ago", "in 3 days")
export const getRelativeTime = (date: string | Date) => {
  return dayjs(date).fromNow();
};

// Check if a date is today
export const isToday = (date: string | Date) => {
  return dayjs(date).isSame(dayjs(), 'day');
};

// Format a date based on how recent it is
export const formatSmartDate = (date: string | Date) => {
  if (isToday(date)) {
    return `Today at ${dayjs(date).format('h:mm A')}`;
  }
  
  // If within the last 7 days, show relative time
  if (dayjs().diff(dayjs(date), 'day') <= 7) {
    return getRelativeTime(date);
  }
  
  // Otherwise, show the full date
  return formatDate(date);
};

const dateUtils = {
  formatDate,
  formatDateTime,
  getRelativeTime,
  isToday,
  formatSmartDate
};

export default dateUtils;
