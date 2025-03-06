import { ColumnAggregationType, ColumnType, hasCustomCalendar, isDateNumColumn, } from '@thoughtspot/ts-chart-sdk';
import _ from 'lodash';
import { fromTsDateValue, isDateField, isMeasureOrMeasureValues } from '../helpers';
export function buildDataAndSchema(chartModel) {
    const columns = chartModel.columns;
    const schema = buildSchema(columns);
    const modelData = chartModel.data;
    const queryModelData = modelData || [];
    const columnsMap = chartModel.columns.reduce((acc, col) => {
        acc.set(col.id, col);
        return acc;
    }, new Map());
    const csvArrData = [schema.map((s) => s.name)];
    const unitModelData = queryModelData[0];
    const queryData = unitModelData.data;
    const rowsLength = queryData.dataValue.length;
    for (let rowIdx = 0; rowIdx < rowsLength; rowIdx++) {
        const rowVals = queryData.dataValue[rowIdx];
        const rowObj = queryData.columns.reduce((acc, curr, colIdx) => {
            const col = columnsMap.get(curr);
            if (!col) {
                return acc;
            }
            const colName = col.name;
            acc[colName] = convertFromTsValue(col, rowVals[colIdx]);
            return acc;
        }, {});
        const rowsCsvData = schema.map((unitSchema) => rowObj[unitSchema.name]);
        csvArrData.push(rowsCsvData);
    }
    return {
        schema,
        data: csvArrData,
    };
}
function buildSchema(columns) {
    return columns.map((col) => {
        let unitSchema;
        if (isMeasureOrMeasureValues(col)) {
            unitSchema = {
                name: col.name,
                type: 'measure',
                subtype: 'continuous',
                defAggFn: extractAggFunc(col),
                displayName: col.name,
            };
        }
        else if (col.type === ColumnType.ATTRIBUTE) {
            if (isDateField(col)) {
                unitSchema = {
                    name: col.name,
                    type: 'dimension',
                    subtype: 'temporal',
                    displayName: col.name,
                };
            }
            else {
                unitSchema = {
                    name: col.name,
                    type: 'dimension',
                    subtype: 'categorical',
                    displayName: col.name,
                };
            }
        }
        else {
            unitSchema = {
                name: col.name,
                type: 'dimension',
                subtype: 'categorical',
                displayName: col.name,
            };
        }
        return unitSchema;
    });
}
function convertFromTsValue(col, tsVal) {
    let datumVal;
    if (hasCustomCalendar(col)) {
        const sVal = _.get(tsVal, ['v', 's'], null);
        if (_.isNil(sVal)) {
            datumVal = null;
        }
        else {
            const rawValue = isDateNumColumn(col) ? Number(sVal) : fromTsDateValue(Number(sVal));
            datumVal = rawValue;
        }
    }
    else if (isDateField(col)) {
        datumVal = _.isNil(tsVal) ? null : fromTsDateValue(Number(tsVal));
    }
    else {
        datumVal = _.isNil(tsVal) ? null : String(tsVal);
    }
    if (typeof datumVal === 'number' && Number.isNaN(datumVal)) {
        datumVal = null;
    }
    return datumVal;
}
function extractAggFunc(col) {
    const tsAggType = col.aggregationType;
    if (!tsAggType) {
        return 'sum';
    }
    switch (tsAggType) {
        case ColumnAggregationType.SUM:
            return 'sum';
        case ColumnAggregationType.AVERAGE:
            return 'avg';
        case ColumnAggregationType.MIN:
            return 'min';
        case ColumnAggregationType.MAX:
            return 'max';
        case ColumnAggregationType.COUNT:
            return 'count';
        case ColumnAggregationType.STD_DEVIATION:
            return 'std';
        default:
            return 'sum';
    }
}
//# sourceMappingURL=index.js.map