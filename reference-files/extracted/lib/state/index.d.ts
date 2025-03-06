import { CustomChartContext } from '@thoughtspot/ts-chart-sdk';
import { RecursivePartial } from '../types';
import { ClientState } from './types';
export declare function getClientState(ctx: CustomChartContext): ClientState;
export declare function updateClientState(ctx: CustomChartContext, stateChanges: RecursivePartial<ClientState>): Promise<void>;
//# sourceMappingURL=index.d.ts.map