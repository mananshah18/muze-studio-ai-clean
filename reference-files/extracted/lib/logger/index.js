let IS_DEBUG_MODE = true;
export const logger = {
    info: (message, ...optionalParams) => {
        if (!IS_DEBUG_MODE) {
            return;
        }
        console.info(message, ...optionalParams);
    },
    error: (message, ...optionalParams) => {
        if (!IS_DEBUG_MODE) {
            return;
        }
        console.error(message, ...optionalParams);
    },
    warn: (message, ...optionalParams) => {
        if (!IS_DEBUG_MODE) {
            return;
        }
        console.warn(message, ...optionalParams);
    },
    debug: (message, ...optionalParams) => {
        if (!IS_DEBUG_MODE) {
            return;
        }
        console.debug(message, ...optionalParams);
    },
};
export function initLogger(isDebugMode) {
    IS_DEBUG_MODE = isDebugMode;
}
//# sourceMappingURL=index.js.map