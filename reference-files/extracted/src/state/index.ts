import { ChartToTSEvent, CustomChartContext, VisualProps } from '@thoughtspot/ts-chart-sdk';
import { getVisualProp } from '../helpers';
import { logger } from '../logger';
import { RecursivePartial } from '../types';
import { safeMerge } from '../utils';
import { CLIENT_STATE_VIS_PROP_KEY, DEFAULT_CLIENT_STATE } from './constants';
import { ClientState } from './types';

export function getClientState(ctx: CustomChartContext): ClientState {
    return safeMerge({} as ClientState, DEFAULT_CLIENT_STATE, extractClientState(ctx));
}

function extractClientState(ctx: CustomChartContext): ClientState {
    const clientStateJsonStr = getVisualProp<string>(
        ctx,
        [CLIENT_STATE_VIS_PROP_KEY],
        JSON.stringify(DEFAULT_CLIENT_STATE),
    );

    try {
        const parsedObj = JSON.parse(String(clientStateJsonStr));
        if (
            !(
                typeof parsedObj === 'object' &&
                parsedObj !== null &&
                !Array.isArray(parsedObj) &&
                typeof parsedObj !== 'function'
            )
        ) {
            return DEFAULT_CLIENT_STATE;
        }

        const clientState = doPurgingIfNeeded(parsedObj);
        return clientState;
    } catch (err) {
        logger.error('Failed to parse client state', err);
        return DEFAULT_CLIENT_STATE;
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function doPurgingIfNeeded(oldState: any): ClientState {
    // @TODO: Implement it when needed.
    return oldState as ClientState;
}

export async function updateClientState(ctx: CustomChartContext, stateChanges: RecursivePartial<ClientState>) {
    const currentState = getClientState(ctx);
    const newState = safeMerge({}, currentState, stateChanges) as ClientState;
    await storeClientState(ctx, newState);
}

async function storeClientState(ctx: CustomChartContext, newState: ClientState) {
    const newClientStateJsonStr = JSON.stringify(newState);
    const existingVisProps = ctx.getChartModel().visualProps ?? ({} as VisualProps);

    const newVisProps = safeMerge({} as VisualProps, existingVisProps);

    // Replace this whole value with the new one.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (newVisProps as any)[CLIENT_STATE_VIS_PROP_KEY] = newClientStateJsonStr;

    await ctx.emitEvent(ChartToTSEvent.UpdateVisualProps, {
        visualProps: newVisProps,
    });
}
