// Make the default DEBUG MODE value to true, so that
// the logs before initializing it gets logged to the console.
let IS_DEBUG_MODE = true;

export const logger = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    info: (message?: any, ...optionalParams: any[]) => {
        if (!IS_DEBUG_MODE) {
            return;
        }
        // eslint-disable-next-line no-console
        console.info(message, ...optionalParams);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: (message?: any, ...optionalParams: any[]) => {
        if (!IS_DEBUG_MODE) {
            return;
        }
        // eslint-disable-next-line no-console
        console.error(message, ...optionalParams);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    warn: (message?: any, ...optionalParams: any[]) => {
        if (!IS_DEBUG_MODE) {
            return;
        }
        // eslint-disable-next-line no-console
        console.warn(message, ...optionalParams);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    debug: (message?: any, ...optionalParams: any[]) => {
        if (!IS_DEBUG_MODE) {
            return;
        }
        // eslint-disable-next-line no-console
        console.debug(message, ...optionalParams);
    },
};

export function initLogger(isDebugMode: boolean) {
    IS_DEBUG_MODE = isDebugMode;
}
