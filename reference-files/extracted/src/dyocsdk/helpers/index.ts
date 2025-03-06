import { Datum } from '../../data/types';
import { rawMuze } from '../raw-muze';

export function isMuzeInvalidValue(value: unknown): boolean {
    return rawMuze.DataStore.isInvalid(value) || value === null || value === undefined;
}

export function muzeRawValueToDatum(muzeRawValue: unknown): Datum {
    if (isMuzeInvalidValue(muzeRawValue)) {
        return null;
    } else if (typeof muzeRawValue === 'number' || muzeRawValue instanceof Date) {
        return Number(muzeRawValue);
    } else {
        return String(muzeRawValue);
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function throttle<T extends (...args: any[]) => void>(
    func: T,
    delay: number,
    options: { leading?: boolean; trailing?: boolean } = { leading: true, trailing: true },
): (...args: Parameters<T>) => void {
    let lastCall = 0;
    let timeout: ReturnType<typeof setTimeout> | null = null;
    let lastArgs: Parameters<T> | undefined;

    const { leading, trailing } = options;

    function invokeFunc() {
        if (lastArgs) {
            func(...lastArgs);
            lastArgs = undefined;
        }
    }

    return function(...args: Parameters<T>) {
        const now = new Date().getTime();
        const timeSinceLastCall = now - lastCall;

        // Update last arguments
        lastArgs = args;

        if (timeSinceLastCall >= delay) {
            // If enough time has passed, execute immediately if leading is enabled
            if (leading) {
                func(...args);
            }
            lastCall = now;

            // If trailing edge is enabled, schedule the trailing execution
            if (trailing) {
                if (timeout) {
                    clearTimeout(timeout);
                }
                timeout = setTimeout(invokeFunc, delay); // Schedule to run after the delay
            }
        } else if (trailing) {
            // If still within throttle period and trailing is enabled, schedule the function call
            if (!timeout) {
                timeout = setTimeout(invokeFunc, delay - timeSinceLastCall);
            }
        }
    };
}
