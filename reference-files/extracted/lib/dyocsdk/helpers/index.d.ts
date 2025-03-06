import { Datum } from '../../data/types';
export declare function isMuzeInvalidValue(value: unknown): boolean;
export declare function muzeRawValueToDatum(muzeRawValue: unknown): Datum;
export declare function throttle<T extends (...args: any[]) => void>(func: T, delay: number, options?: {
    leading?: boolean;
    trailing?: boolean;
}): (...args: Parameters<T>) => void;
//# sourceMappingURL=index.d.ts.map