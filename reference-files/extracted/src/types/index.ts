import { TS_NULL_VALUE } from '../constants';

export type ColorPallette = { primaryColor: string; secondaryColors: string[] };

export type WithRequiredProps<Type> = {
    [prop in keyof Type]-?: Type[prop];
};

export type RecursivePartial<T> = {
    [P in keyof T]?: T[P] extends (infer U)[]
        ? RecursivePartial<U>[]
        : T[P] extends object | undefined
        ? RecursivePartial<T[P]>
        : T[P];
};

export type TSRawValue = string | number | typeof TS_NULL_VALUE;
