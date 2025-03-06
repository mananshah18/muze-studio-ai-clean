import { CSVArrayData, Schema } from './external-deps';

export interface SDKInitData {
    data: CSVArrayData;
    schema: Schema;
    tsSystemInfo: TSSystemInfo;
}

export interface TSSystemInfo {
    isDebugMode: boolean;
    isLiveboardContext: boolean;
    isMobile: boolean;
    isPrintMode: boolean;
    colorPallettes: string[];
}
