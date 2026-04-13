

export const currencyFormatter = (value?: number): [string, string] => {
    return [value != null ? `$${value.toFixed(2)}` : '', 'Spent'];
};

export type CurrencyFormatterType = (value: number | undefined) => [string, string];
