import { ChannelEvent } from '../../external-deps';
import { throttle } from '../../helpers';
import { muzeHandleContextMenuInteraction } from '../../interactions/context-menu';
import { logger } from '../../logger';
import { rawMuze } from '../../raw-muze';
export function buildCanvasAPI(ctx) {
    const muzeGlobalContext = rawMuze();
    return {
        canvas: (muzeContext) => {
            const resolvedContext = muzeContext || muzeGlobalContext;
            const canvas = resolvedContext.canvas({ isPrintMode: !!ctx.tsSystemInfo.isPrintMode });
            const contextMenuInteraction = {
                enabled: true,
                hook: (muzePayload) => muzeHandleContextMenuInteraction(muzePayload, ctx.commChannel, ctx.schema),
            };
            canvas
                .config({
                interaction: {
                    contextMenu: contextMenuInteraction,
                },
                axes: {
                    x: {
                        interaction: { contextMenu: contextMenuInteraction },
                    },
                    y: {
                        interaction: { contextMenu: contextMenuInteraction },
                    },
                },
                rows: {
                    facets: {
                        interaction: { contextMenu: contextMenuInteraction },
                    },
                },
                columns: {
                    facets: {
                        interaction: { contextMenu: contextMenuInteraction },
                    },
                },
                legend: {
                    color: {
                        range: [...ctx.tsSystemInfo.colorPallettes],
                    },
                },
            })
                .layers([
                {
                    mark: 'bar',
                    encoding: {
                        color: { value: () => ctx.tsSystemInfo.colorPallettes[0] },
                    },
                },
            ])
                .once('animationEnd', () => {
                ctx.commChannel.emit(ChannelEvent.RenderCompleted, null, window.parent);
            });
            const originalMountFn = canvas.mount.bind(canvas);
            canvas.mount = (...args) => {
                if (args[0]) {
                    handleChartDimensionSubscription(args[0], canvas);
                }
                return originalMountFn(...args);
            };
            return canvas;
        },
    };
}
export function handleChartDimensionSubscription(mountElem, muzeCanvas) {
    const canvasContainer = mountElem instanceof HTMLElement ? mountElem : document.querySelector(String(mountElem));
    if (!canvasContainer) {
        return;
    }
    const setCanvasDimens = throttle((newContainerDimens) => {
        logger.info('CANVAS NEW WIDTH, HEIGHT: ', newContainerDimens);
        muzeCanvas.width(newContainerDimens.width);
        muzeCanvas.height(newContainerDimens.height);
    }, 300, { trailing: true });
    setCanvasDimens({ width: canvasContainer.clientWidth, height: canvasContainer.clientHeight });
    if (window.ResizeObserver) {
        const resizeObserver = new ResizeObserver((entries) => {
            const lastEntry = entries[entries.length - 1];
            if (!lastEntry) {
                return;
            }
            const newContainerWidth = lastEntry.contentRect.width;
            const newContainerHeight = lastEntry.contentRect.height;
            setCanvasDimens({ width: newContainerWidth, height: newContainerHeight });
        });
        resizeObserver.observe(canvasContainer);
        muzeCanvas.on('afterDisposed', () => {
            resizeObserver.disconnect();
        });
    }
}
//# sourceMappingURL=canvas.js.map