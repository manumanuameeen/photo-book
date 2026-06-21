const userLocale = navigator.language || undefined;

export const formatLocalDate = (
  value: string | number | Date,
  options?: Intl.DateTimeFormatOptions,
) => new Date(value).toLocaleDateString(userLocale, options);

export const formatLocalDateTime = (
  value: string | number | Date,
  options?: Intl.DateTimeFormatOptions,
) => new Date(value).toLocaleString(userLocale, options);

export const formatLocalTime = (
  value: string | number | Date,
  options?: Intl.DateTimeFormatOptions,
) => new Date(value).toLocaleTimeString(userLocale, options);
