import { IframeCommunicationChannel } from '../../comm';
import { ChannelEvent, ShowContextMenuPayload, ShowContextMenuPayloadUnitDataPath } from '../../comm/types';
import { Datum, Schema } from '../../data/types';
import { muzeRawValueToDatum } from '../helpers';
import { MuzeType } from '../raw-muze';

export function muzeHandleContextMenuInteraction(
    muzePayload: MuzeType,
    commChannel: IframeCommunicationChannel,
    schema: Schema,
) {
    const { type: muzeType } = muzePayload;
    const resolvedType =
        muzeType === 'rowFacetHeader'
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

    const emitContextMenuEvent = (payload: ShowContextMenuPayload) => {
        commChannel.emit(ChannelEvent.ShowContextMenu, payload, window.parent);
    };

    if (
        muzeType === 'rowFacetHeader' ||
        muzeType === 'columnFacetHeader' ||
        muzeType === 'xAxes' ||
        muzeType === 'yAxes'
    ) {
        const resolvedDataPath: ShowContextMenuPayloadUnitDataPath[] = (muzePayload.dataPath || []).map(
            (dp: MuzeType) => ({
                field: dp.field,
                value: muzeRawValueToDatum(dp.value),
            }),
        );

        emitContextMenuEvent({
            type: resolvedType,
            event: {
                clientX: muzePayload.event.clientX,
                clientY: muzePayload.event.clientY,
            },
            dataPath: resolvedDataPath,
        });
    } else if (muzeType === 'geom') {
        const { targetPoint: muzeTargetPoint, colFacets: muzeColFacets, rowFacets: muzeRowFacets } = muzePayload;

        let resolvedTargetPoint: Record<string, Datum>[] | null = null;
        if (muzeTargetPoint && muzeTargetPoint.length >= 2) {
            const muzeTargetCols = muzeTargetPoint[0];
            const muzeTargetPoints = muzeTargetPoint.slice(1);
            resolvedTargetPoint = muzeTargetPoints.map((point: MuzeType) => {
                return muzeTargetCols.reduce((acc: Record<string, Datum>, curr: MuzeType, idx: number) => {
                    const isFound = schema?.find((us) => us.name === curr);
                    if (isFound) {
                        acc[curr] = muzeRawValueToDatum(point[idx]);
                    }
                    return acc;
                }, {} as Record<string, Datum>);
            });
        } else {
            resolvedTargetPoint = null;
        }

        const [resolvedColFacets, resolvedRowFacets] = [muzeColFacets, muzeRowFacets].map((muzeFacets) => {
            return Object.entries(muzeFacets || {}).reduce((acc, [field, value]) => {
                acc[field] = muzeRawValueToDatum(value);
                return acc;
            }, {} as Record<string, Datum>);
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
