/**
 * Converte uma string de camelCase para snake_case
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Converte uma string de snake_case para camelCase
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Converte todas as chaves de um objeto de snake_case para camelCase
 */
export function snakeToCamelObject(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(snakeToCamelObject);
  if (typeof obj !== 'object') return obj;

  const converted: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const camelKey = snakeToCamel(key);
      converted[camelKey] = snakeToCamelObject(obj[key]);
    }
  }
  return converted;
}

/**
 * Converte todas as chaves de um objeto de camelCase para snake_case
 */
export function camelToSnakeObject(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(camelToSnakeObject);
  if (typeof obj !== 'object') return obj;

  const converted: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const snakeKey = camelToSnake(key);
      converted[snakeKey] = camelToSnakeObject(obj[key]);
    }
  }
  return converted;
}

// Aliases para objetos
export const convertSnakeToCamel = snakeToCamelObject;
export const convertCamelToSnake = camelToSnakeObject;
