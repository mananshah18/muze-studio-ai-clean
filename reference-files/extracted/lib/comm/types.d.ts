import { Datum } from '../data/types';
export interface MessageData {
    type: keyof ChannelEventPayloadMap;
    payload: ChannelEventPayloadMap[ChannelEvent];
}
export declare enum ChannelEvent {
    ShowContextMenu = "ShowContextMenu",
    RenderCompleted = "RenderCompleted",
    HideAllContextMenus = "HideAllContextMenus"
}
export interface ChannelEventPayloadMap {
    [ChannelEvent.ShowContextMenu]: ShowContextMenuPayload;
    [ChannelEvent.RenderCompleted]: null;
    [ChannelEvent.HideAllContextMenus]: null;
}
export interface ShowContextMenuPayload {
    type: 'rows-facet' | 'columns-facet' | 'x-axis-tick' | 'y-axis-tick' | 'data-point';
    event: {
        clientX: number;
        clientY: number;
    };
    dataPath?: ShowContextMenuPayloadUnitDataPath[];
    targetPoint?: Record<string, Datum>[] | null;
    colFacets?: Record<string, Datum>;
    rowFacets?: Record<string, Datum>;
}
export declare type ShowContextMenuPayloadUnitDataPath = {
    field: string;
    value: Datum;
};
//# sourceMappingURL=types.d.ts.map