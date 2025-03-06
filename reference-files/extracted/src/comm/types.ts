import { Datum } from '../data/types';

export interface MessageData {
    type: keyof ChannelEventPayloadMap;
    payload: ChannelEventPayloadMap[ChannelEvent];
}

export enum ChannelEvent {
    ShowContextMenu = 'ShowContextMenu',
    RenderCompleted = 'RenderCompleted',
    HideAllContextMenus = 'HideAllContextMenus',
}

export interface ChannelEventPayloadMap {
    [ChannelEvent.ShowContextMenu]: ShowContextMenuPayload;
    [ChannelEvent.RenderCompleted]: null;
    [ChannelEvent.HideAllContextMenus]: null;
}

export interface ShowContextMenuPayload {
    type: 'rows-facet' | 'columns-facet' | 'x-axis-tick' | 'y-axis-tick' | 'data-point';
    event: { clientX: number; clientY: number };
    dataPath?: ShowContextMenuPayloadUnitDataPath[];
    targetPoint?: Record<string, Datum>[] | null;
    colFacets?: Record<string, Datum>;
    rowFacets?: Record<string, Datum>;
}

export type ShowContextMenuPayloadUnitDataPath = { field: string; value: Datum };
