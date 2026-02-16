/**
 * Utilitaires de transformation snake_case ↔ camelCase
 * pour la communication entre le frontend (camelCase) et le backend FastAPI (snake_case)
 */

/**
 * Convertit une chaîne snake_case en camelCase
 */
export function snakeToCamel(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * Convertit une chaîne camelCase en snake_case
 */
export function camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

/**
 * Convertit récursivement les clés d'un objet de snake_case à camelCase
 */
export function transformKeysToCamel<T = any>(obj: any): T {
    if (obj === null || obj === undefined) return obj
    if (Array.isArray(obj)) return obj.map(transformKeysToCamel) as T
    if (typeof obj !== 'object') return obj
    if (obj instanceof Date) return obj as T
    if (obj instanceof Blob) return obj as T

    const result: Record<string, any> = {}
    for (const [key, value] of Object.entries(obj)) {
        const camelKey = snakeToCamel(key)
        result[camelKey] = transformKeysToCamel(value)
    }
    return result as T
}

/**
 * Convertit récursivement les clés d'un objet de camelCase à snake_case
 */
export function transformKeysToSnake<T = any>(obj: any): T {
    if (obj === null || obj === undefined) return obj
    if (Array.isArray(obj)) return obj.map(transformKeysToSnake) as T
    if (typeof obj !== 'object') return obj
    if (obj instanceof Date) return obj as T
    if (obj instanceof File) return obj as T
    if (obj instanceof FormData) return obj as T
    if (obj instanceof Blob) return obj as T

    const result: Record<string, any> = {}
    for (const [key, value] of Object.entries(obj)) {
        const snakeKey = camelToSnake(key)
        result[snakeKey] = transformKeysToSnake(value)
    }
    return result as T
}
