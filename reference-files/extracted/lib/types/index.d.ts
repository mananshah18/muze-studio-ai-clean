import { TS_NULL_VALUE } from '../constants';
export declare type ColorPallette = {
    primaryColor: string;
    secondaryColors: string[];
};
export declare type WithRequiredProps<Type> = {
    [prop in keyof Type]-?: Type[prop];
};
export declare type RecursivePartial<T> = {
    [P in keyof T]?: T[P] extends (infer U)[] ? RecursivePartial<U>[] : T[P] extends object | undefined ? RecursivePartial<T[P]> : T[P];
};
export declare type TSRawValue = string | number | typeof TS_NULL_VALUE;
//# sourceMappingURL=index.d.ts.map