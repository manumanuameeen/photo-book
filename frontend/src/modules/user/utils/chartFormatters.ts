/**
 * Chart formatter utilities for Recharts tooltips
 * Provides properly typed formatter functions without `any` casts
 */

export const currencyFormatter = (value?: number): [string, string] => {
    return [value != null ? `$${value.toFixed(2)}` : '', 'Spent'];
};

export type CurrencyFormatterType = (value: number | undefined) => [string, string];
