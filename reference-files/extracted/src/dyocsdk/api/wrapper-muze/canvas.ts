import { ChannelEvent } from '../../external-deps';
import { throttle } from '../../helpers';
import { muzeHandleContextMenuInteraction } from '../../interactions/context-menu';
import { logger } from '../../logger';
import { MuzeType, rawMuze } from '../../raw-muze';
import { APIBuilderContext } from '../types';

export function buildCanvasAPI(ctx: APIBuilderContext) {
    const muzeGlobalContext = rawMuze();

    return {
        canvas: (muzeContext?: unknown) => {
            const resolvedContext = muzeContext || muzeGlobalContext;
            const canvas = resolvedContext.canvas({ isPrintMode: !!ctx.tsSystemInfo.isPrintMode });

            const contextMenuInteraction = {
                enabled: true,
                hook: (muzePayload: MuzeType) =>
                    muzeHandleContextMenuInteraction(muzePayload, ctx.commChannel, ctx.schema),
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
                    // @TODO: If there are multiple canvases, then we also need to wait for them
                    // to emit the 'ChannelEvent.RenderCompleted' event.
                    ctx.commChannel.emit(ChannelEvent.RenderCompleted, null, window.parent);
                });

            const originalMountFn = canvas.mount.bind(canvas);
            // Handle setter and getter mode.
            canvas.mount = (...args: MuzeType[]) => {
                if (args[0]) {
                    // @TODO: If user sets width, height explicitly, then it will not work,
                    // as this subscription will override those with chart container's dimensions.
                    // We need to fix it.
                    handleChartDimensionSubscription(args[0], canvas);
                }
                return originalMountFn(...args);
            };

            return canvas;
        },
    };
}

export function handleChartDimensionSubscription(mountElem: HTMLElement | string, muzeCanvas: MuzeType) {
    const canvasContainer = mountElem instanceof HTMLElement ? mountElem : document.querySelector(String(mountElem));
    if (!canvasContainer) {
        return;
    }

    const setCanvasDimens = throttle(
        (newContainerDimens: { width: number; height: number }) => {
            logger.info('CANVAS NEW WIDTH, HEIGHT: ', newContainerDimens);
            muzeCanvas.width(newContainerDimens.width);
            muzeCanvas.height(newContainerDimens.height);
        },
        300,
        { trailing: true },
    );

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
