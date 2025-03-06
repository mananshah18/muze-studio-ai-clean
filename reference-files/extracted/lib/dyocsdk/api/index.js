import { buildDataAPI } from './data';
import { buildEnvAPI } from './env';
import { buildWrapperMuzeAPI } from './wrapper-muze';
export function buildSDKAPI(ctx) {
    return {
        ...buildDataAPI(ctx),
        ...buildEnvAPI(ctx),
        ...buildWrapperMuzeAPI(ctx),
    };
}
//# sourceMappingURL=index.js.map