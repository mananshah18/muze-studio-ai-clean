import { ChartSpecificColumnType, ColumnType, DataType, isDateNumColumn, } from '@thoughtspot/ts-chart-sdk';
import _ from 'lodash';
import { TS_NULL_VALUE } from '../constants';
export function isMeasureOrMeasureValues(col) {
    return col.type === ColumnType.MEASURE || isMeasureValues(col);
}
export function isMeasureValues(col) {
    return col.chartSpecificColumnType === ChartSpecificColumnType.MEASURE_VALUES;
}
export function isDateField(col) {
    return col.dataType === DataType.DATE || col.dataType === DataType.TIME || col.dataType === DataType.DATE_TIME;
}
export function extractColorPallettes(ctx) {
    const appConfig = ctx.getAppConfig();
    const numColorPalettes = appConfig.styleConfig?.numColorPalettes;
    const numOfColorPerPallette = 5;
    const segmentMidIdx = Math.floor(numOfColorPerPallette / 2);
    let chartColorPalettes = undefined;
    const tsColors = appConfig.styleConfig?.chartColorPalettes?.[0]?.colors;
    if (Array.isArray(tsColors) && Array.isArray(tsColors[0])) {
        chartColorPalettes = tsColors?.[0];
    }
    else if (Array.isArray(tsColors) && typeof tsColors[0] === 'string') {
        chartColorPalettes = tsColors.slice();
    }
    if (!numColorPalettes || !chartColorPalettes) {
        return [];
    }
    if (chartColorPalettes.length !== numColorPalettes * numOfColorPerPallette) {
        throw new Error('The length of colors in appConfig.styleConfig?.chartColorPalettes does not match with the numColorPalettes * 5');
    }
    const colorPallettes = [];
    for (let i = 0; i < numColorPalettes; i++) {
        const startIdx = i * numOfColorPerPallette;
        const primaryColor = chartColorPalettes[startIdx + segmentMidIdx];
        const secondaryColors = [];
        for (let j = 0; j < numOfColorPerPallette; j++) {
            if (j !== segmentMidIdx) {
                secondaryColors.push(chartColorPalettes[startIdx + j]);
            }
        }
        colorPallettes.push({ primaryColor, secondaryColors });
    }
    return colorPallettes;
}
export function getMeasureCols(cols) {
    return cols.filter((c) => c.type === ColumnType.MEASURE);
}
export function getAttributeCols(cols) {
    return cols.filter((c) => c.type === ColumnType.ATTRIBUTE);
}
export function getVisualProp(ctx, props, defaultValue) {
    const chartModel = ctx.getChartModel();
    return getVisualPropFromChartModel(chartModel, props, defaultValue);
}
export function getVisualPropFromChartModel(chartModel, props, defaultValue) {
    const visProps = chartModel.visualProps;
    if (!visProps) {
        return defaultValue;
    }
    const val = _.get(visProps, props);
    return val === undefined || val === null ? defaultValue : val;
}
export function pushToPointTuple(point, columnId, value) {
    const isExists = point.tuple.find((t) => t.columnId === columnId);
    if (isExists) {
        return;
    }
    point.tuple.push({
        columnId,
        value,
    });
}
export function convertDatumToTSValue(col, value) {
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
export function fromTsDateValue(tsTimestamp) {
    return tsTimestamp * 1000;
}
export function toTsDateValue(timestamp) {
    return timestamp / 1000;
}
export function isMnMvColumn(col) {
    return (col.chartSpecificColumnType === ChartSpecificColumnType.MEASURE_NAMES ||
        col.chartSpecificColumnType === ChartSpecificColumnType.MEASURE_VALUES);
}
//# sourceMappingURL=index.js.map