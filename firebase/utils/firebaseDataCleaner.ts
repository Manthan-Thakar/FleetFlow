/**
 * Recursively clean an object by replacing undefined values with null
 * This prevents Firebase errors when saving data with undefined fields
 */
export const cleanData = <T extends Record<string, any>>(data: T): T => {
  if (data === null || data === undefined) {
    return null as any;
  }

  if (typeof data !== 'object' || data instanceof Date) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => cleanData(item)) as any;
  }

  const cleaned: Record<string, any> = {};

  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = data[key];

      if (value === undefined) {
        cleaned[key] = null;
      } else if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
        cleaned[key] = cleanData(value);
      } else {
        cleaned[key] = value;
      }
    }
  }

  return cleaned as T;
};
