export interface BarChartSettings<T> {
    id: string;
    type: 'bar-chart';
    title: string;

    // layout: 'vertical' | 'horizontal';
    keySelector: (value: T) => string;
    bars: {
        title: string;
        valueSelector: (value: T) => number | null;
        color: string;
        stackId?: string;
    }[];

    limit?: {
        count: number;
        method: 'min' | 'max';
        valueSelector: (value: T) => number | null;
    };

    dependencies?: number[];
}
export interface PieChartSettings<T> {
    id: string;
    type: 'pie-chart';
    title: string;

    keySelector: (value: T) => string;
    valueSelector: (value: T) => string;

    colorPalette?: string[];

    dependencies?: [];
}

export type ChartSettings<T> = BarChartSettings<T> | PieChartSettings<T>;

export function isBarChart<T>(settings: ChartSettings<T>): settings is BarChartSettings<T> {
    return settings.type === 'bar-chart';
}
export function isPieChart<T>(settings: ChartSettings<T>): settings is PieChartSettings<T> {
    return settings.type === 'pie-chart';
}
