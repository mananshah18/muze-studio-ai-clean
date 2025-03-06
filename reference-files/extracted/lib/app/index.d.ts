import { CustomChartContext } from '@thoughtspot/ts-chart-sdk';
import { IframeCommunicationChannel } from '../comm';
import { CodeEditors } from '../editors';
import { PlaygroundData } from '../playground-data/types';
export declare class App {
    private isMounted;
    private ctx;
    private previewIframeContainer;
    private codEditors;
    private playgroundData;
    private iframeCommChannels;
    init(): Promise<void>;
    createTSContext(): Promise<CustomChartContext>;
    addVisualPropUpdateListener(): void;
    render(): Promise<void>;
    doRender(): Promise<void>;
    mount(): Promise<void>;
    updatePreviewAndStoreCode(): Promise<void>;
    setupTabs(tabs: {
        tabBtn: HTMLElement;
        editorContainer: HTMLElement;
    }[]): void;
    createEditors(containers: {
        js: HTMLElement;
        css: HTMLElement;
        html: HTMLElement;
    }, onChange: () => void | Promise<void>): CodeEditors;
    createIframeCommChannels(): IframeCommunicationChannel;
    hideAllContextMenu(): Promise<void>;
    setupPanelResizeInteractions(): void;
    generatePlaygroundDataFromClientState(): Promise<PlaygroundData>;
    storeLatestCodeInClientState(): Promise<void>;
    updateCodeEditorsFromClientState(): void;
    updatePreview(): Promise<void>;
    waitOnPreviewRendered(): Promise<boolean>;
    private getCtxOrThrow;
    private getEditorsOrThrow;
    private getIframeCommChannelsOrThrow;
    loadCSSStyles(): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map