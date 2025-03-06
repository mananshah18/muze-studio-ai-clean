import { rawMuze } from '../raw-muze';
export function isMuzeInvalidValue(value) {
    return rawMuze.DataStore.isInvalid(value) || value === null || value === undefined;
}
export function muzeRawValueToDatum(muzeRawValue) {
    if (isMuzeInvalidValue(muzeRawValue)) {
        return null;
    }
    else if (typeof muzeRawValue === 'number' || muzeRawValue instanceof Date) {
        return Number(muzeRawValue);
    }
    else {
        return String(muzeRawValue);
    }
}
export function throttle(func, delay, options = { leading: true, trailing: true }) {
    let lastCall = 0;
    let timeout = null;
    let lastArgs;
    const { leading, trailing } = options;
    function invokeFunc() {
        if (lastArgs) {
            func(...lastArgs);
            lastArgs = undefined;
        }
    }
    return function (...args) {
        const now = new Date().getTime();
        const timeSinceLastCall = now - lastCall;
        lastArgs = args;
        if (timeSinceLastCall >= delay) {
            if (leading) {
                func(...args);
            }
            lastCall = now;
            if (trailing) {
                if (timeout) {
                    clearTimeout(timeout);
                }
                timeout = setTimeout(invokeFunc, delay);
            }
        }
        else if (trailing) {
            if (!timeout) {
                timeout = setTimeout(invokeFunc, delay - timeSinceLastCall);
            }
        }
    };
}
//# sourceMappingURL=index.js.map