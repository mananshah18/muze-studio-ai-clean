import { buildDataAPI } from './data';
import { buildEnvAPI } from './env';
import { APIBuilderContext } from './types';
import { buildWrapperMuzeAPI } from './wrapper-muze';

export function buildSDKAPI(ctx: APIBuilderContext) {
    return {
        ...buildDataAPI(ctx),
        ...buildEnvAPI(ctx),
        ...buildWrapperMuzeAPI(ctx),
    };
}
