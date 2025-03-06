import { rawMuze } from '../../raw-muze';
export function buildDataAPI(ctx) {
    return {
        getDataFromSearchQuery: () => {
            const formattedData = rawMuze.DataModel.loadDataSync(ctx.data, ctx.schema);
            const dm = new rawMuze.DataModel(formattedData);
            return dm;
        },
    };
}
//# sourceMappingURL=index.js.map