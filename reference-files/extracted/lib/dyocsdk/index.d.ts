import './styles.css';
import { SDKInitData } from './types';
export default function DYOCSDK(initData: SDKInitData): {
    muze: {
        canvas: (muzeContext?: unknown) => any;
        DataStore: any;
        DataModel: any;
        version: any;
        SideEffects: any;
        ActionModel: any;
        layerFactory: any;
        Operators: any;
        Behaviours: any;
        utils: any;
        Themes: any;
    };
    env: {
        isDebugMode: boolean;
        isLiveboardContext: boolean;
        isMobile: boolean;
        isPrintMode: boolean;
        colorPallettes: string[];
    };
    getDataFromSearchQuery: () => any;
};
//# sourceMappingURL=index.d.ts.map