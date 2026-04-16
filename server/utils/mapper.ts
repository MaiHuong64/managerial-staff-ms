import { toCamel, toSnake } from "snake-camel";

// Dịch một Object
export const mapToCamel = <T>(data: any): T => {
    if (!data) return data;
    return toCamel(data) as T;
};

// Dịch một Mảng (Array)
export const mapArrayToCamel = <T>(data: any[]): T[] => {
    if (!data || !data.length) return [];
    return data.map(item => toCamel(item) as T);
};

// Dịch ngược lại cho DB
export const mapToSnake = <T>(data: any): T => {
    if (!data) return data;
    return toSnake(data) as T;
}