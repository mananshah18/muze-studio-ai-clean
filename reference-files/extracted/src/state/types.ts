/**
 * @CAUTION: This type is serialized as JSON and stored in persistent storage.
 * So, be careful while renaming props name or updating the structure.
 * Update the `version` prop, in case of incompatible major updates in the type structure
 * and add necessary purging logic.
 */

import { PlaygroundVersion } from '../playground-data/types';

// @SERIALIZABLE
export interface ClientState {
    version: number;

    playground: {
        version: PlaygroundVersion;
        code: {
            jsCodeBase64: string;
            cssCodeBase64: string;
            htmlCodeBase64: string;
        };
        splitSizes: [number, number];
    };
}
