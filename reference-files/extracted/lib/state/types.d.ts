import { PlaygroundVersion } from '../playground-data/types';
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
//# sourceMappingURL=types.d.ts.map