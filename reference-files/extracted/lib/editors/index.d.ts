export declare class CodeEditors {
    private jsEditor;
    private cssEditor;
    private htmlEditor;
    private isProgrammaticChange;
    constructor(containers: {
        js: HTMLElement;
        css: HTMLElement;
        html: HTMLElement;
    }, onChange: () => void);
    setValues(codes: {
        js: string;
        css: string;
        html: string;
    }): void;
    getValues(): {
        js: string;
        css: string;
        html: string;
    };
}
//# sourceMappingURL=index.d.ts.map