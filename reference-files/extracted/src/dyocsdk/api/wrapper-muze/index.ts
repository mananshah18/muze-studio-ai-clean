import { rawMuze } from '../../raw-muze';
import { APIBuilderContext } from '../types';
import { buildCanvasAPI } from './canvas';

export function buildWrapperMuzeAPI(ctx: APIBuilderContext) {
    return {
        muze: {
            DataStore: rawMuze.DataStore,
            DataModel: rawMuze.DataModel,
            version: rawMuze.version,
            SideEffects: rawMuze.SideEffects,
            ActionModel: rawMuze.ActionModel,
            layerFactory: rawMuze.layerFactory,
            Operators: rawMuze.Operators,
            Behaviours: rawMuze.Behaviours,
            utils: rawMuze.utils,
            Themes: rawMuze.Themes,

            ...buildCanvasAPI(ctx),
        },
    };
}
