import { rawMuze } from '../../raw-muze';
import { APIBuilderContext } from '../types';

export function buildDataAPI(ctx: APIBuilderContext) {
    return {
        getDataFromSearchQuery: () => {
            const formattedData = rawMuze.DataModel.loadDataSync(ctx.data, ctx.schema);
            const dm = new rawMuze.DataModel(formattedData);
            return dm;
        },
    };
}
