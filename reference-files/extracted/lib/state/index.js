import { ChartToTSEvent } from '@thoughtspot/ts-chart-sdk';
import { getVisualProp } from '../helpers';
import { logger } from '../logger';
import { safeMerge } from '../utils';
import { CLIENT_STATE_VIS_PROP_KEY, DEFAULT_CLIENT_STATE } from './constants';
export function getClientState(ctx) {
    return safeMerge({}, DEFAULT_CLIENT_STATE, extractClientState(ctx));
}
function extractClientState(ctx) {
    const clientStateJsonStr = getVisualProp(ctx, [CLIENT_STATE_VIS_PROP_KEY], JSON.stringify(DEFAULT_CLIENT_STATE));
    try {
        const parsedObj = JSON.parse(String(clientStateJsonStr));
        if (!(typeof parsedObj === 'object' &&
            parsedObj !== null &&
            !Array.isArray(parsedObj) &&
            typeof parsedObj !== 'function')) {
            return DEFAULT_CLIENT_STATE;
        }
        const clientState = doPurgingIfNeeded(parsedObj);
        return clientState;
    }
    catch (err) {
        logger.error('Failed to parse client state', err);
        return DEFAULT_CLIENT_STATE;
    }
}
function doPurgingIfNeeded(oldState) {
    return oldState;
}
export async function updateClientState(ctx, stateChanges) {
    const currentState = getClientState(ctx);
    const newState = safeMerge({}, currentState, stateChanges);
    await storeClientState(ctx, newState);
}
async function storeClientState(ctx, newState) {
    const newClientStateJsonStr = JSON.stringify(newState);
    const existingVisProps = ctx.getChartModel().visualProps ?? {};
    const newVisProps = safeMerge({}, existingVisProps);
    newVisProps[CLIENT_STATE_VIS_PROP_KEY] = newClientStateJsonStr;
    await ctx.emitEvent(ChartToTSEvent.UpdateVisualProps, {
        visualProps: newVisProps,
    });
}
//# sourceMappingURL=index.js.map