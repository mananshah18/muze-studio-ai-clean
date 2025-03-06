import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import { MONACO_EDITOR_OPTIONS } from './constants';
import { IStandaloneCodeEditor } from './types';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
self.MonacoEnvironment = {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    getWorker(_, label) {
        if (label === 'json') {
            return new jsonWorker();
        }
        if (label === 'css' || label === 'scss' || label === 'less') {
            return new cssWorker();
        }
        if (label === 'html' || label === 'handlebars' || label === 'razor') {
            return new htmlWorker();
        }
        if (label === 'typescript' || label === 'javascript') {
            return new tsWorker();
        }
        return new editorWorker();
    },
};

export class CodeEditors {
    private jsEditor: IStandaloneCodeEditor;
    private cssEditor: IStandaloneCodeEditor;
    private htmlEditor: IStandaloneCodeEditor;

    private isProgrammaticChange = {
        js: false,
        css: false,
        html: false,
    };

    constructor(containers: { js: HTMLElement; css: HTMLElement; html: HTMLElement }, onChange: () => void) {
        this.jsEditor = monaco.editor.create(containers.js, {
            ...MONACO_EDITOR_OPTIONS,
            value: '',
            language: 'javascript',
        });
        this.jsEditor.getModel()?.onDidChangeContent(() => {
            if (this.isProgrammaticChange.js) {
                this.isProgrammaticChange.js = false;
                return;
            }
            onChange();
        });

        this.cssEditor = monaco.editor.create(containers.css, {
            ...MONACO_EDITOR_OPTIONS,
            value: '',
            language: 'css',
        });
        this.cssEditor.getModel()?.onDidChangeContent(() => {
            if (this.isProgrammaticChange.css) {
                this.isProgrammaticChange.css = false;
                return;
            }
            onChange();
        });

        this.htmlEditor = monaco.editor.create(containers.html, {
            ...MONACO_EDITOR_OPTIONS,
            value: '',
            language: 'html',
        });
        this.htmlEditor.getModel()?.onDidChangeContent(() => {
            if (this.isProgrammaticChange.html) {
                this.isProgrammaticChange.html = false;
                return;
            }
            onChange();
        });
    }

    setValues(codes: { js: string; css: string; html: string }) {
        this.isProgrammaticChange = {
            js: true,
            css: true,
            html: true,
        };

        this.jsEditor.setValue(codes.js);
        this.cssEditor.setValue(codes.css);
        this.htmlEditor.setValue(codes.html);
    }

    getValues(): { js: string; css: string; html: string } {
        return {
            js: this.jsEditor.getValue(),
            css: this.cssEditor.getValue(),
            html: this.htmlEditor.getValue(),
        };
    }
}
