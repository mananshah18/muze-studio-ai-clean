export function buildEnvAPI(ctx) {
    return {
        env: {
            isDebugMode: ctx.tsSystemInfo.isDebugMode,
            isLiveboardContext: ctx.tsSystemInfo.isLiveboardContext,
            isMobile: ctx.tsSystemInfo.isMobile,
            isPrintMode: ctx.tsSystemInfo.isPrintMode,
            colorPallettes: ctx.tsSystemInfo.colorPallettes,
        },
    };
}
//# sourceMappingURL=index.js.map