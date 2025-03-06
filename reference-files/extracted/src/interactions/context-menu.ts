import {
    ChartColumn,
    ChartSpecificColumnType,
    ChartToTSEvent,
    ColumnType,
    CustomChartContext,
    Point,
} from '@thoughtspot/ts-chart-sdk';
import { ShowContextMenuPayload } from '../comm/types';
import { TS_NULL_VALUE } from '../constants';
import { Datum } from '../data/types';
import { convertDatumToTSValue, isMnMvColumn, pushToPointTuple } from '../helpers';
import { logger } from '../logger';
import { TSRawValue } from '../types';

export async function handleContextMenuEvent(ctx: CustomChartContext, payload: ShowContextMenuPayload) {
    const columnsMap = ctx.getChartModel().columns.reduce((acc, col) => {
        acc.set(col.name, col);
        return acc;
    }, new Map<string, ChartColumn>());

    // @TODO: Use better approach to check a totals value.
    const isTotalsValue = (val: Datum) => val === 'All';

    logger.info('columnsMap', columnsMap);
    logger.info('Context menu payload', payload);

    // Hide previous context menu if any.
    await ctx.emitEvent(ChartToTSEvent.CloseContextMenu);

    const { type, event, dataPath, targetPoint, colFacets, rowFacets } = payload;

    let allPoints: Point[] = [];
    if (type === 'rows-facet' || type === 'columns-facet' || type === 'x-axis-tick' || type === 'y-axis-tick') {
        const point: Point = { tuple: [] };

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
                } else {
                    pushToPointTuple(point, col.id, convertDatumToTSValue(col, value));
                }
            }
        });

        allPoints = [point];
    } else if (type === 'data-point') {
        allPoints = (targetPoint || []).map((tPoint) => {
            const selectedPoint: Point = {
                tuple: [],
            };

            // Push all facet fields first.
            [colFacets || {}, rowFacets || {}].forEach((facets) => {
                Object.entries(facets).forEach(([field, value]) => {
                    const col = columnsMap.get(field);
                    if (col && !isMnMvColumn(col) && !isTotalsValue(value)) {
                        pushToPointTuple(selectedPoint, col.id, convertDatumToTSValue(col, value));
                    }
                });
            });

            const attributes: {
                field: string;
                value: TSRawValue;
            }[] = [];
            const measures: {
                field: string;
                value: TSRawValue;
            }[] = [];

            let mnFieldValue: string | undefined = undefined;
            Object.entries(tPoint).forEach(([field, value]) => {
                const col = columnsMap.get(field);
                if (
                    col?.chartSpecificColumnType === ChartSpecificColumnType.MEASURE_NAMES &&
                    typeof value === 'string'
                ) {
                    mnFieldValue = value;
                }
            });

            Object.entries(tPoint).forEach(([field, value]) => {
                // @TODO: Remove all totals value items at the end.
                if (isTotalsValue(value)) {
                    return;
                }

                const col = columnsMap.get(field);
                if (!col || isMnMvColumn(col)) {
                    return;
                }

                // @TODO: Properly filter out non-participating fields.
                if (value === null) {
                    return;
                }

                const tsVal = convertDatumToTSValue(col, value);

                if (col.type === ColumnType.ATTRIBUTE) {
                    attributes.push({ field, value: tsVal });
                } else if (col.type === ColumnType.MEASURE) {
                    if (mnFieldValue) {
                        if (mnFieldValue === col.name) {
                            measures.push({ field, value: tsVal });
                        }
                    } else {
                        measures.push({ field, value: tsVal });
                    }
                }
            });

            // Inject attribute fields first, then measure fields.
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
