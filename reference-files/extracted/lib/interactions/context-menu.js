import { ChartSpecificColumnType, ChartToTSEvent, ColumnType, } from '@thoughtspot/ts-chart-sdk';
import { TS_NULL_VALUE } from '../constants';
import { convertDatumToTSValue, isMnMvColumn, pushToPointTuple } from '../helpers';
import { logger } from '../logger';
export async function handleContextMenuEvent(ctx, payload) {
    const columnsMap = ctx.getChartModel().columns.reduce((acc, col) => {
        acc.set(col.name, col);
        return acc;
    }, new Map());
    const isTotalsValue = (val) => val === 'All';
    logger.info('columnsMap', columnsMap);
    logger.info('Context menu payload', payload);
    await ctx.emitEvent(ChartToTSEvent.CloseContextMenu);
    const { type, event, dataPath, targetPoint, colFacets, rowFacets } = payload;
    let allPoints = [];
    if (type === 'rows-facet' || type === 'columns-facet' || type === 'x-axis-tick' || type === 'y-axis-tick') {
        const point = { tuple: [] };
        (dataPath || []).forEach(({ field, value }) => {
            const col = columnsMap.get(field);
            if (col && !isTotalsValue(value)) {
                if (col.chartSpecificColumnType === ChartSpecificColumnType.MEASURE_NAMES) {
                    if (typeof value === 'string') {
                        const measureField = columnsMap.get(value);
                        if (measureField) {
                            pushToPointTuple(point, measureField.id, TS_NULL_VALUE);
                        }
                    }
                }
                else {
                    pushToPointTuple(point, col.id, convertDatumToTSValue(col, value));
                }
            }
        });
        allPoints = [point];
    }
    else if (type === 'data-point') {
        allPoints = (targetPoint || []).map((tPoint) => {
            const selectedPoint = {
                tuple: [],
            };
            [colFacets || {}, rowFacets || {}].forEach((facets) => {
                Object.entries(facets).forEach(([field, value]) => {
                    const col = columnsMap.get(field);
                    if (col && !isMnMvColumn(col) && !isTotalsValue(value)) {
                        pushToPointTuple(selectedPoint, col.id, convertDatumToTSValue(col, value));
                    }
                });
            });
            const attributes = [];
            const measures = [];
            let mnFieldValue = undefined;
            Object.entries(tPoint).forEach(([field, value]) => {
                const col = columnsMap.get(field);
                if (col?.chartSpecificColumnType === ChartSpecificColumnType.MEASURE_NAMES &&
                    typeof value === 'string') {
                    mnFieldValue = value;
                }
            });
            Object.entries(tPoint).forEach(([field, value]) => {
                if (isTotalsValue(value)) {
                    return;
                }
                const col = columnsMap.get(field);
                if (!col || isMnMvColumn(col)) {
                    return;
                }
                if (value === null) {
                    return;
                }
                const tsVal = convertDatumToTSValue(col, value);
                if (col.type === ColumnType.ATTRIBUTE) {
                    attributes.push({ field, value: tsVal });
                }
                else if (col.type === ColumnType.MEASURE) {
                    if (mnFieldValue) {
                        if (mnFieldValue === col.name) {
                            measures.push({ field, value: tsVal });
                        }
                    }
                    else {
                        measures.push({ field, value: tsVal });
                    }
                }
            });
            [...attributes, ...measures].forEach(({ field, value }) => {
                const col = columnsMap.get(field);
                if (col) {
                    pushToPointTuple(selectedPoint, col.id, value);
                }
            });
            return selectedPoint;
        });
    }
    allPoints = allPoints.filter((p) => p.tuple.length);
    logger.info('All Points: ', JSON.stringify(allPoints, null, 2));
    if (!allPoints.length) {
        return;
    }
    const selectedPoints = allPoints.slice();
    const clickedPoint = selectedPoints[0];
    logger.info('clickedPoint', JSON.stringify(clickedPoint, null, 2));
    logger.info('selectedPoints', JSON.stringify(selectedPoints, null, 2));
    await ctx.emitEvent(ChartToTSEvent.OpenContextMenu, {
        event: {
            clientX: event.clientX,
            clientY: event.clientY,
        },
        clickedPoint,
        selectedPoints,
    });
}
//# sourceMappingURL=context-menu.js.map