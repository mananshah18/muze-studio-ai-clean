import { ChannelEvent } from '../../comm/types';
import { muzeRawValueToDatum } from '../helpers';
export function muzeHandleContextMenuInteraction(muzePayload, commChannel, schema) {
    const { type: muzeType } = muzePayload;
    const resolvedType = muzeType === 'rowFacetHeader'
        ? 'rows-facet'
        : muzeType === 'columnFacetHeader'
            ? 'columns-facet'
            : muzeType === 'xAxes'
                ? 'x-axis-tick'
                : muzeType === 'yAxes'
                    ? 'y-axis-tick'
                    : muzeType === 'geom'
                        ? 'data-point'
                        : null;
    if (!resolvedType) {
        return;
    }
    const emitContextMenuEvent = (payload) => {
        commChannel.emit(ChannelEvent.ShowContextMenu, payload, window.parent);
    };
    if (muzeType === 'rowFacetHeader' ||
        muzeType === 'columnFacetHeader' ||
        muzeType === 'xAxes' ||
        muzeType === 'yAxes') {
        const resolvedDataPath = (muzePayload.dataPath || []).map((dp) => ({
            field: dp.field,
            value: muzeRawValueToDatum(dp.value),
        }));
        emitContextMenuEvent({
            type: resolvedType,
            event: {
                clientX: muzePayload.event.clientX,
                clientY: muzePayload.event.clientY,
            },
            dataPath: resolvedDataPath,
        });
    }
    else if (muzeType === 'geom') {
        const { targetPoint: muzeTargetPoint, colFacets: muzeColFacets, rowFacets: muzeRowFacets } = muzePayload;
        let resolvedTargetPoint = null;
        if (muzeTargetPoint && muzeTargetPoint.length >= 2) {
            const muzeTargetCols = muzeTargetPoint[0];
            const muzeTargetPoints = muzeTargetPoint.slice(1);
            resolvedTargetPoint = muzeTargetPoints.map((point) => {
                return muzeTargetCols.reduce((acc, curr, idx) => {
                    const isFound = schema?.find((us) => us.name === curr);
                    if (isFound) {
                        acc[curr] = muzeRawValueToDatum(point[idx]);
                    }
                    return acc;
                }, {});
            });
        }
        else {
            resolvedTargetPoint = null;
        }
        const [resolvedColFacets, resolvedRowFacets] = [muzeColFacets, muzeRowFacets].map((muzeFacets) => {
            return Object.entries(muzeFacets || {}).reduce((acc, [field, value]) => {
                acc[field] = muzeRawValueToDatum(value);
                return acc;
            }, {});
        });
        emitContextMenuEvent({
            type: resolvedType,
            event: {
                clientX: muzePayload.event.clientX,
                clientY: muzePayload.event.clientY,
            },
            targetPoint: resolvedTargetPoint,
            colFacets: resolvedColFacets,
            rowFacets: resolvedRowFacets,
        });
    }
}
//# sourceMappingURL=context-menu.js.map