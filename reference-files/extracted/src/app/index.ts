import {
    ChartConfig,
    ChartModel,
    ChartToTSEvent,
    CustomChartContext,
    getChartContext,
    Query,
    TSToChartEvent,
} from '@thoughtspot/ts-chart-sdk';
import _ from 'lodash';
import Split from 'split.js';
import { IframeCommunicationChannel } from '../comm';
import { ChannelEvent } from '../comm/types';
import { CodeEditors } from '../editors';
import { handleContextMenuEvent } from '../interactions/context-menu';
import { initLogger, logger } from '../logger';
import imgActiveCodeIcon from '../media/code-active.svg';
import imgNormalCodeIcon from '../media/code-normal.svg';
import imgInfoCircle from '../media/info-circle.svg';
import { LATEST_PLAYGROUND_VERSION } from '../playground-data';
import { PlaygroundData } from '../playground-data/types';
import { PLAYGROUND_VERSION_DATA_MAP } from '../playground-data/version-map';
import { getClientState, updateClientState } from '../state';
import { byIdOrThrow, decodeBase64, encodeBase64 } from '../utils';
import { loadSingleCssURL } from '../utils/loadCSS';
import {
    generateDefaultCSSCodeSample,
    generateDefaultHTMLCodeSample,
    generateDefaultJsCodeSample,
} from './code-samples';
import { getRootContainer } from './helpers';
import { generatePreviewCode } from './preview-code';

export class App {
    private isMounted = false;
    private ctx: CustomChartContext | null = null;
    private previewIframeContainer: HTMLElement | null = null;
    private codEditors: CodeEditors | null = null;
    private playgroundData: PlaygroundData | null = null;
    private iframeCommChannels: IframeCommunicationChannel | null = null;

    async init() {
        this.ctx = await this.createTSContext();
        initLogger(!!this.ctx.getAppConfig().appOptions?.isDebugMode);
        this.addVisualPropUpdateListener();

        logger.info('CONTEXT', this.ctx);

        await this.loadCSSStyles();

        document.addEventListener('click', async () => {
            await this.hideAllContextMenu();
        });

        await this.render();
    }

    async createTSContext(): Promise<CustomChartContext> {
        const ctx = await getChartContext({
            allowedConfigurations: {
                allowColumnConditionalFormatting: false,
                allowColumnNumberFormatting: false,
                allowMeasureNamesAndValues: false,
            },
            getDefaultChartConfig: (chartModel: ChartModel): ChartConfig[] => {
                const cols = chartModel.columns.filter(
                    // @TODO: Remove this line once the MN/MV feature is added.
                    (c) => !['Measure names', 'Measure values'].includes(c.name),
                );

                const basicConfig: ChartConfig = {
                    key: 'basic',
                    dimensions: [
                        {
                            key: 'fields',
                            columns: cols.slice(),
                        },
                    ],
                };

                logger.info('DEFAULT CHART CONFIG', basicConfig);

                return [basicConfig];
            },
            getQueriesFromChartConfig: (chartConfig: ChartConfig[], chartModel: ChartModel): Array<Query> => {
                const allCols = chartModel.columns.slice();
                const validCols = allCols.filter(
                    // @TODO: Remove this line once the MN/MV feature is added.
                    (c) => !['Measure names', 'Measure values'].includes(c.name),
                );

                const query: Query = { queryColumns: validCols.slice(), queryParams: { size: 20000 } };

                logger.info('QUERY', query);

                return [query];
            },
            renderChart: async (ctx: CustomChartContext) => {
                this.ctx = ctx;
                await this.render();
            },
            chartConfigEditorDefinition: [
                {
                    key: 'basic',
                    label: 'Basic',
                    columnSections: [
                        {
                            key: 'fields',
                            label: 'Fields',
                            allowAttributeColumns: true,
                            allowMeasureColumns: true,
                            allowTimeSeriesColumns: true,
                            allowMeasureNameColumn: true,
                            allowMeasureValueColumn: true,
                        },
                    ],
                },
            ],
            visualPropEditorDefinition: {
                elements: [],
            },
        });

        return ctx;
    }

    addVisualPropUpdateListener() {
        this.ctx?.on(TSToChartEvent.VisualPropsUpdate, (): { triggerRenderChart: boolean } => {
            // @TODO: It will skip the render on visual props update from the UI also. It will be
            // resolved once this task is done: https://thoughtspot.atlassian.net/browse/SCAL-236524
            logger.info('RENDER IS SKIPPED');

            logger.info('CLIENT STATE', getClientState(this.getCtxOrThrow()));

            return {
                triggerRenderChart: false,
            };
        });
    }

    async render() {
        try {
            await this.ctx?.emitEvent(ChartToTSEvent.RenderStart);
            await this.doRender();
        } catch (error) {
            logger.error(error);
            const errMsg = error instanceof Error ? error.message : String(error);
            await this.ctx?.emitEvent(ChartToTSEvent.RenderError, {
                hasError: true,
                error: errMsg,
            });
        } finally {
            await this.ctx?.emitEvent(ChartToTSEvent.RenderComplete);
        }
    }

    // @CAUTION: This function will be executed every time the chart configs
    // or the settings in UI or the clientState are updated. So, be careful to manage the resources.
    // Make sure to cache the evaluated values.
    async doRender() {
        logger.info('RENDERING APP');

        if (!this.isMounted) {
            await this.mount();
            this.isMounted = true;
            logger.info('APP IS MOUNTED');
        } else {
            logger.info('APP IS ALREADY MOUNTED');
        }

        logger.info('CLIENT STATE', getClientState(this.getCtxOrThrow()));

        this.updateCodeEditorsFromClientState();

        this.playgroundData = await this.generatePlaygroundDataFromClientState();
        logger.info('PLAYGROUND DATA', this.playgroundData);

        // This should be at the end.
        await this.updatePreview();
    }

    async mount() {
        const ctx = this.getCtxOrThrow();
        const rootContainer = getRootContainer(ctx);
        const isLiveBoardContext = !!ctx.getAppConfig().appOptions?.isLiveboardContext;
        const isPrintMode = !!ctx.getAppConfig().appOptions?.isPrintMode;

        // eslint-disable-next-line no-unsanitized/property
        rootContainer.innerHTML = `
            <div id="app" class="preview-only-view ${isLiveBoardContext ? 'livaboard-view' : ''} ${
            isPrintMode ? 'printmode-view' : ''
        }">
                <div class="section preview">
                    <div class="code-icon-btn open-editors-btn" id="open-editors-btn">
                        <img src="${imgNormalCodeIcon}" />
                    </div>
                    <div id="preview-iframe-container"></div>
                </div>
                <div class="section editors">
                    <div class="actions">
                        <div class="code-icon-btn" id="hide-editors-btn">
                            <img src="${imgActiveCodeIcon}" />
                        </div>
                        <div class="tab-actions">
                            <button class="tab-button active" id="js-tab-btn">JavaScript</button>
                            <button class="tab-button" id="css-tab-btn">CSS</button>
                            <button class="tab-button" id="html-tab-btn">HTML</button>
                        </div>
                        <div>
                            <button class="button" id="run-btn">Run</button>
                        </div>
                    </div>
                    <div class="editors-container">
                        <div class="editor active" id="js-editor"></div>
                        <div class="editor" id="css-editor"></div>
                        <div class="editor" id="html-editor"></div>
                        <div class="docs-container">
                            <a href="https://cyoc-documentation-site.vercel.app/" target="_blank">
                                <img src="${imgInfoCircle}" />
                                <span>Read Docs</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        if (!isLiveBoardContext && !isPrintMode) {
            this.setupPanelResizeInteractions();
        }

        const appContainer = byIdOrThrow('app');
        const previewIframeContainer = byIdOrThrow('preview-iframe-container');
        const jsTabBtn = byIdOrThrow('js-tab-btn');
        const cssTabBtn = byIdOrThrow('css-tab-btn');
        const htmlTabBtn = byIdOrThrow('html-tab-btn');
        const jsEditorContainer = byIdOrThrow('js-editor');
        const cssEditorContainer = byIdOrThrow('css-editor');
        const htmlEditorContainer = byIdOrThrow('html-editor');
        const runBtn = byIdOrThrow('run-btn');
        const openEditorsBtn = byIdOrThrow('open-editors-btn');
        const hideEditorsBtn = byIdOrThrow('hide-editors-btn');

        this.previewIframeContainer = previewIframeContainer;

        this.setupTabs([
            {
                tabBtn: jsTabBtn,
                editorContainer: jsEditorContainer,
            },
            {
                tabBtn: cssTabBtn,
                editorContainer: cssEditorContainer,
            },
            {
                tabBtn: htmlTabBtn,
                editorContainer: htmlEditorContainer,
            },
        ]);

        this.codEditors = this.createEditors(
            {
                js: jsEditorContainer,
                css: cssEditorContainer,
                html: htmlEditorContainer,
            },
            async () => {
                runBtn.classList.add('active');
                await this.storeLatestCodeInClientState();
            },
        );

        this.iframeCommChannels = this.createIframeCommChannels();

        openEditorsBtn.addEventListener('click', () => {
            appContainer.classList.remove('preview-only-view');
        });

        hideEditorsBtn.addEventListener('click', () => {
            appContainer.classList.add('preview-only-view');
        });

        runBtn.addEventListener('click', async () => {
            runBtn.classList.remove('active');
            await this.updatePreviewAndStoreCode();
        });
    }

    async updatePreviewAndStoreCode() {
        await this.storeLatestCodeInClientState();
        await this.updatePreview();
    }

    setupTabs(
        tabs: {
            tabBtn: HTMLElement;
            editorContainer: HTMLElement;
        }[],
    ) {
        tabs.forEach((tab) => {
            tab.tabBtn.addEventListener('click', () => {
                tabs.forEach((t) => {
                    t.tabBtn.classList.remove('active');
                    t.editorContainer.classList.remove('active');
                });

                tab.tabBtn.classList.add('active');
                tab.editorContainer.classList.add('active');
            });
        });
    }

    createEditors(
        containers: { js: HTMLElement; css: HTMLElement; html: HTMLElement },
        onChange: () => void | Promise<void>,
    ): CodeEditors {
        return new CodeEditors(containers, _.debounce(onChange, 500, { leading: false, trailing: true }));
    }

    createIframeCommChannels(): IframeCommunicationChannel {
        const channel = new IframeCommunicationChannel();

        channel.on(ChannelEvent.ShowContextMenu, (payload) => {
            handleContextMenuEvent(this.getCtxOrThrow(), payload);
        });

        channel.on(ChannelEvent.HideAllContextMenus, async () => {
            await this.hideAllContextMenu();
        });

        return channel;
    }

    async hideAllContextMenu() {
        await this.ctx?.emitEvent(ChartToTSEvent.CloseContextMenu);
        await this.ctx?.emitEvent(ChartToTSEvent.CloseAxisMenu);
    }

    setupPanelResizeInteractions() {
        const {
            playground: { splitSizes },
        } = getClientState(this.getCtxOrThrow());

        Split(['.section.preview', '.section.editors'], {
            sizes: splitSizes,
            minSize: 200,
            gutter: () => {
                const elem = document.createElement('div');
                elem.className = 'section gutter';

                elem.innerHTML = `
                    <div class="middle-border"></div>
                `;

                return elem;
            },
            gutterSize: 8,
            onDragEnd: async (sizes: number[]) => {
                await updateClientState(this.getCtxOrThrow(), {
                    playground: {
                        splitSizes: [sizes[0], sizes[1]],
                    },
                });
            },
        });
    }

    async generatePlaygroundDataFromClientState() {
        const {
            playground: { version: pgVersion },
        } = getClientState(this.getCtxOrThrow());

        let pgDataGenerator = PLAYGROUND_VERSION_DATA_MAP.get(pgVersion);
        if (!pgDataGenerator) {
            logger.warn(
                'The playground version from client state could not be found, now using the latest playground data: ',
                pgVersion,
            );
            pgDataGenerator = PLAYGROUND_VERSION_DATA_MAP.get(LATEST_PLAYGROUND_VERSION);
        }

        const pgData = pgDataGenerator?.(this.getCtxOrThrow());
        if (!pgData) {
            throw new Error('Failed to evaluate the playground data');
        }

        return pgData;
    }

    async storeLatestCodeInClientState() {
        const codes = this.codEditors?.getValues();

        await updateClientState(this.getCtxOrThrow(), {
            playground: {
                code: {
                    jsCodeBase64: encodeBase64(codes?.js ?? ''),
                    cssCodeBase64: encodeBase64(codes?.css ?? ''),
                    htmlCodeBase64: encodeBase64(codes?.html ?? ''),
                },
            },
        });
    }

    updateCodeEditorsFromClientState() {
        const editors = this.getEditorsOrThrow();
        const {
            playground: {
                code: { jsCodeBase64, cssCodeBase64, htmlCodeBase64 },
            },
        } = getClientState(this.getCtxOrThrow());

        const jsCode = jsCodeBase64 ? decodeBase64(jsCodeBase64) : generateDefaultJsCodeSample(this.getCtxOrThrow());
        const cssCode = cssCodeBase64 ? decodeBase64(cssCodeBase64) : generateDefaultCSSCodeSample();
        const htmlCode = htmlCodeBase64 ? decodeBase64(htmlCodeBase64) : generateDefaultHTMLCodeSample();

        editors.setValues({ js: jsCode, css: cssCode, html: htmlCode });
    }

    async updatePreview() {
        const previewIframeContainer = this.previewIframeContainer;
        if (!previewIframeContainer) {
            throw new Error('The preview iframe container is not created yet');
        }

        const editors = this.getEditorsOrThrow();

        const pgData = this.playgroundData;
        if (!pgData) {
            throw new Error('The playground data is not evaluated yet');
        }

        const { js: jsCode, css: cssCode, html: htmlCode } = editors.getValues();

        const output = generatePreviewCode(pgData, jsCode, cssCode, htmlCode);

        logger.info('PREVIEW CODE', output);

        const previewIframe = document.createElement('iframe');
        previewIframe.setAttribute('frameborder', '0');
        previewIframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');

        previewIframeContainer.querySelectorAll('iframe').forEach((elem) => previewIframeContainer.removeChild(elem));
        previewIframeContainer.appendChild(previewIframe);

        const outputDoc = previewIframe.contentDocument || previewIframe.contentWindow?.document;

        if (!outputDoc) {
            throw new Error("The preview iframe document couldn't  be found");
        }

        // @TODO: Wait for the chart to be rendered, but if there are some errors, we will still render the chart,
        // but we will not wait for the chart render event.
        // The errors could be:
        //  1. Syntax error in the JS code.
        //  2. Unhandled promise rejection in the JS code.
        //  3. The chart is not rendered due to some other errors.
        //  4. The chart is rendered but the render event is not fired.

        // const renderCompletePromise = this.waitOnPreviewRendered();
        outputDoc.open();
        outputDoc.write(output);
        outputDoc.close();
        // await renderCompletePromise;
    }

    waitOnPreviewRendered(): Promise<boolean> {
        let resolveFn: ((value: boolean | PromiseLike<boolean>) => void) | null = null;

        this.getIframeCommChannelsOrThrow().once(ChannelEvent.RenderCompleted, () => {
            resolveFn?.(true);
        });

        // eslint-disable-next-line compat/compat
        return new Promise((resolve) => {
            resolveFn = resolve;
        });
    }

    private getCtxOrThrow(): CustomChartContext {
        if (!this.ctx) {
            throw new Error('The TS Context is not created yet');
        }
        return this.ctx;
    }

    private getEditorsOrThrow(): CodeEditors {
        const editors = this.codEditors;
        if (!editors) {
            throw new Error('The code editors are not created yet');
        }
        return editors;
    }

    private getIframeCommChannelsOrThrow(): IframeCommunicationChannel {
        const iframeCommChannels = this.iframeCommChannels;
        if (!iframeCommChannels) {
            throw new Error('The iframe comm channels are not created yet');
        }
        return iframeCommChannels;
    }

    async loadCSSStyles() {
        await loadSingleCssURL(
            // eslint-disable-next-line compat/compat
            new URL('./styles.css', import.meta.url).pathname,
        ).catch((err) => logger.error(err));
    }
}
