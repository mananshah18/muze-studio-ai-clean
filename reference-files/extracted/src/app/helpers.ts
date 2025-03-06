import { CustomChartContext } from '@thoughtspot/ts-chart-sdk';

export function getRootContainer(ctx: CustomChartContext): HTMLElement {
    if (ctx.containerEl) {
        return ctx.containerEl;
    }

    const container = document.getElementById('root');
    if (container) {
        return container;
    }

    throw new Error("Couldn't find a container to mount the DYOC app");
}
