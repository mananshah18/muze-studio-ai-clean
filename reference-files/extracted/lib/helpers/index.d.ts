import { ChartColumn, ChartModel, CustomChartContext, Point } from '@thoughtspot/ts-chart-sdk';
import { Datum } from '../data/types';
import { ColorPallette, TSRawValue } from '../types';
export declare function isMeasureOrMeasureValues(col: ChartColumn): boolean;
export declare function isMeasureValues(col: ChartColumn): boolean;
export declare function isDateField(col: ChartColumn): boolean;
export declare function extractColorPallettes(ctx: CustomChartContext): ColorPallette[];
export declare function getMeasureCols(cols: ChartColumn[]): ChartColumn[];
export declare function getAttributeCols(cols: ChartColumn[]): ChartColumn[];
export declare function getVisualProp<T>(ctx: CustomChartContext, props: string[], defaultValue: T): T;
export declare function getVisualPropFromChartModel<T>(chartModel: ChartModel, props: string[], defaultValue: T): T;
export declare function pushToPointTuple(point: Point, columnId: string, value: TSRawValue): void;
export declare function convertDatumToTSValue(col: ChartColumn, value: Datum): TSRawValue;
export declare function fromTsDateValue(tsTimestamp: number): number;
export declare function toTsDateValue(timestamp: number): number;
export declare function isMnMvColumn(col: ChartColumn): boolean;
//# sourceMappingURL=index.d.ts.map