// @SERIALIZABLE
export interface PlaygroundData {
    version: PlaygroundVersion;
    dyocSDK: {
        jsCdnUrl: string;
        cssCdnUrl: string;
        initData: unknown;
        sdkKey: string;
    };
    font: {
        fontFamily: string;
        fontsCdnUrl: string;
    };
}

// @SERIALIZABLE
export enum PlaygroundVersion {
    V1 = 'v1',
    Unknown = 'unknown',
}
