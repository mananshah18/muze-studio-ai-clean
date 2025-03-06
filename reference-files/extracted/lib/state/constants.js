import { LATEST_PLAYGROUND_VERSION } from '../playground-data';
export const CLIENT_STATE_VIS_PROP_KEY = 'clientState';
export const CLIENT_STATE_SCHEMA_LATEST_VERSION = 1;
export const DEFAULT_CLIENT_STATE = {
    version: CLIENT_STATE_SCHEMA_LATEST_VERSION,
    playground: {
        version: LATEST_PLAYGROUND_VERSION,
        code: {
            jsCodeBase64: '',
            cssCodeBase64: '',
            htmlCodeBase64: '',
        },
        splitSizes: [55, 45],
    },
};
//# sourceMappingURL=constants.js.map