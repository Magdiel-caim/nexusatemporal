"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertCamelToSnake = exports.convertSnakeToCamel = void 0;
exports.camelToSnake = camelToSnake;
exports.snakeToCamel = snakeToCamel;
exports.snakeToCamelObject = snakeToCamelObject;
exports.camelToSnakeObject = camelToSnakeObject;
/**
 * Converte uma string de camelCase para snake_case
 */
function camelToSnake(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}
/**
 * Converte uma string de snake_case para camelCase
 */
function snakeToCamel(str) {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}
/**
 * Converte todas as chaves de um objeto de snake_case para camelCase
 */
function snakeToCamelObject(obj) {
    if (obj === null || obj === undefined)
        return obj;
    if (Array.isArray(obj))
        return obj.map(snakeToCamelObject);
    if (typeof obj !== 'object')
        return obj;
    const converted = {};
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
function camelToSnakeObject(obj) {
    if (obj === null || obj === undefined)
        return obj;
    if (Array.isArray(obj))
        return obj.map(camelToSnakeObject);
    if (typeof obj !== 'object')
        return obj;
    const converted = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const snakeKey = camelToSnake(key);
            converted[snakeKey] = camelToSnakeObject(obj[key]);
        }
    }
    return converted;
}
// Aliases para objetos
exports.convertSnakeToCamel = snakeToCamelObject;
exports.convertCamelToSnake = camelToSnakeObject;
//# sourceMappingURL=case-converter.js.map