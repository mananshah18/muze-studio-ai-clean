import { ChannelEventPayloadMap } from './types';
export declare class IframeCommunicationChannel {
    private listeners;
    constructor();
    on<T extends keyof ChannelEventPayloadMap>(type: T, callback: (payload: ChannelEventPayloadMap[T]) => void): void;
    once<T extends keyof ChannelEventPayloadMap>(type: T, callback: (payload: ChannelEventPayloadMap[T]) => void): void;
    off<T extends keyof ChannelEventPayloadMap>(type: T, callback: (payload: ChannelEventPayloadMap[T]) => void): void;
    emit<T extends keyof ChannelEventPayloadMap>(type: T, payload: ChannelEventPayloadMap[T], targetWindow: Window): void;
    private handleMessage;
}
//# sourceMappingURL=index.d.ts.map