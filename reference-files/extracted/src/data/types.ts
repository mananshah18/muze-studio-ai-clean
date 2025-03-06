export const AVAILABLE_AGGREGATION_FUNCS = ['sum', 'avg', 'min', 'max', 'first', 'last', 'count', 'std'] as const;

export type CSVArrayData = Datum[][];

export type Datum = string | number | boolean | null | undefined;

export type AggregationFuncType = typeof AVAILABLE_AGGREGATION_FUNCS[number];

export type Schema = UnitSchema[];

export type UnitSchema =
    | ContinuousMeasureUnitSchema
    | CategoricalDimensionUnitSchema
    | TemporalDimensionUnitSchema
    | BinnedDimensionUnitSchema;

interface BaseUnitSchema {
    name: string;
    displayName: string;
}

interface DimensionUnitSchema extends BaseUnitSchema {
    type: 'dimension';
}

export interface BinnedDimensionUnitSchema extends DimensionUnitSchema {
    subtype: 'binned';
    binSize: number;
}

export interface CategoricalDimensionUnitSchema extends DimensionUnitSchema {
    subtype: 'categorical';
}

export interface TemporalDimensionUnitSchema extends DimensionUnitSchema {
    subtype: 'temporal';
    format?: string;
}

interface MeasureUnitSchema extends BaseUnitSchema {
    type: 'measure';
}

export interface ContinuousMeasureUnitSchema extends MeasureUnitSchema {
    subtype: 'continuous';
    defAggFn: AggregationFuncType;
}
