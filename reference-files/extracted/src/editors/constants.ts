import { IStandaloneEditorConstructionOptions } from './types';

export const MONACO_EDITOR_OPTIONS: IStandaloneEditorConstructionOptions = {
    automaticLayout: true,
    scrollBeyondLastLine: false,
    minimap: {
        enabled: false,
    },
    wordWrap: 'off',
    wordBasedSuggestions: true,
    theme: 'vs',
};
