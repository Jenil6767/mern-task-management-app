import { format, isPast, parseISO } from 'date-fns';

export const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    return format(parseISO(dateString), 'MMM dd, yyyy');
  } catch (error) {
    return dateString;
  }
};

export const isOverdue = (dateString) => {
  if (!dateString) return false;
  try {
    const date = parseISO(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return isPast(date) && date < today;
  } catch (error) {
    return false;
  }
};

