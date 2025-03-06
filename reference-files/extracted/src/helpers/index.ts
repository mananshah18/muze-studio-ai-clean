import {
    ChartColumn,
    ChartModel,
    ChartSpecificColumnType,
    ColumnType,
    CustomChartContext,
    DataType,
    isDateNumColumn,
    Point,
} from '@thoughtspot/ts-chart-sdk';
import _ from 'lodash';
import { TS_NULL_VALUE } from '../constants';
import { Datum } from '../data/types';
import { ColorPallette, TSRawValue } from '../types';

export function isMeasureOrMeasureValues(col: ChartColumn) {
    return col.type === ColumnType.MEASURE || isMeasureValues(col);
}

export function isMeasureValues(col: ChartColumn) {
    return col.chartSpecificColumnType === ChartSpecificColumnType.MEASURE_VALUES;
}

export function isDateField(col: ChartColumn): boolean {
    return col.dataType === DataType.DATE || col.dataType === DataType.TIME || col.dataType === DataType.DATE_TIME;
}

export function extractColorPallettes(ctx: CustomChartContext): ColorPallette[] {
    const appConfig = ctx.getAppConfig();
    const numColorPalettes = appConfig.styleConfig?.numColorPalettes;
    const numOfColorPerPallette = 5;
    const segmentMidIdx = Math.floor(numOfColorPerPallette / 2);

    // @TODO: Use appropriate approach once the `colors` API structure is fixed.
    let chartColorPalettes: string[] | undefined = undefined;
    const tsColors = appConfig.styleConfig?.chartColorPalettes?.[0]?.colors;
    if (Array.isArray(tsColors) && Array.isArray(tsColors[0])) {
        chartColorPalettes = tsColors?.[0];
    } else if (Array.isArray(tsColors) && typeof tsColors[0] === 'string') {
        chartColorPalettes = tsColors.slice();
    }

    if (!numColorPalettes || !chartColorPalettes) {
        return [];
    }

    if (chartColorPalettes.length !== numColorPalettes * numOfColorPerPallette) {
        throw new Error(
            'The length of colors in appConfig.styleConfig?.chartColorPalettes does not match with the numColorPalettes * 5',
        );
    }

    const colorPallettes: ColorPallette[] = [];

    for (let i = 0; i < numColorPalettes; i++) {
        const startIdx = i * numOfColorPerPallette;

        // The middle color is the primary color.
        const primaryColor = chartColorPalettes[startIdx + segmentMidIdx];

        // The remaining colors are secondary colors.
        const secondaryColors: string[] = [];
        for (let j = 0; j < numOfColorPerPallette; j++) {
            if (j !== segmentMidIdx) {
                secondaryColors.push(chartColorPalettes[startIdx + j]);
            }
        }

        colorPallettes.push({ primaryColor, secondaryColors });
    }

    return colorPallettes;
}

// @TODO: Should we consider "Measure values" field as measure?
export function getMeasureCols(cols: ChartColumn[]): ChartColumn[] {
    return cols.filter((c) => c.type === ColumnType.MEASURE);
}

export function getAttributeCols(cols: ChartColumn[]): ChartColumn[] {
    return cols.filter((c) => c.type === ColumnType.ATTRIBUTE);
}

export function getVisualProp<T>(ctx: CustomChartContext, props: string[], defaultValue: T): T {
    const chartModel = ctx.getChartModel();
    return getVisualPropFromChartModel(chartModel, props, defaultValue);
}

export function getVisualPropFromChartModel<T>(chartModel: ChartModel, props: string[], defaultValue: T): T {
    const visProps = chartModel.visualProps;
    if (!visProps) {
        return defaultValue;
    }

    const val = _.get(visProps, props);

    return val === undefined || val === null ? defaultValue : val;
}

export function pushToPointTuple(point: Point, columnId: string, value: TSRawValue) {
    const isExists = point.tuple.find((t) => t.columnId === columnId);
    if (isExists) {
        return;
    }

    point.tuple.push({
        columnId,
        value,
    });
}

export function convertDatumToTSValue(col: ChartColumn, value: Datum): TSRawValue {
    if (value === null || value === undefined || value === TS_NULL_VALUE) {
        return TS_NULL_VALUE;
    }

    if (isDateNumColumn(col)) {
        return +value;
    }

    if (isDateField(col)) {
        return toTsDateValue(+value);
    }

    if (typeof value === 'number' || typeof value === 'string') {
        return value;
    }

    return String(value);
}

export function fromTsDateValue(tsTimestamp: number): number {
    return tsTimestamp * 1000;
}

export function toTsDateValue(timestamp: number): number {
    return timestamp / 1000;
}

export function isMnMvColumn(col: ChartColumn) {
    return (
        col.chartSpecificColumnType === ChartSpecificColumnType.MEASURE_NAMES ||
        col.chartSpecificColumnType === ChartSpecificColumnType.MEASURE_VALUES
    );
}
