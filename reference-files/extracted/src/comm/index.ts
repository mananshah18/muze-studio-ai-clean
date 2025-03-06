import { logger } from '../logger';
import { ChannelEventPayloadMap, MessageData } from './types';

export class IframeCommunicationChannel {
    private listeners: Map<
        keyof ChannelEventPayloadMap,
        ((payload: ChannelEventPayloadMap[keyof ChannelEventPayloadMap]) => void)[]
    >;

    constructor() {
        this.listeners = new Map();

        window.addEventListener('message', this.handleMessage.bind(this));
    }

    on<T extends keyof ChannelEventPayloadMap>(type: T, callback: (payload: ChannelEventPayloadMap[T]) => void) {
        if (!this.listeners.has(type)) {
            this.listeners.set(type, []);
        }
        this.listeners.get(type)?.push(callback);
    }

    once<T extends keyof ChannelEventPayloadMap>(type: T, callback: (payload: ChannelEventPayloadMap[T]) => void) {
        const wrapper = (payload: ChannelEventPayloadMap[T]) => {
            callback(payload);
            this.off(type, wrapper);
        };
        this.on(type, wrapper);
    }

    off<T extends keyof ChannelEventPayloadMap>(type: T, callback: (payload: ChannelEventPayloadMap[T]) => void) {
        if (this.listeners.has(type)) {
            const callbacks = this.listeners.get(type)?.filter((cb) => cb !== callback);
            callbacks && this.listeners.set(type, callbacks);
        }
    }

    emit<T extends keyof ChannelEventPayloadMap>(type: T, payload: ChannelEventPayloadMap[T], targetWindow: Window) {
        const message: MessageData = { type, payload };
        targetWindow.postMessage(message); // @TODO: Specify the target origin.
    }

    private handleMessage(event: MessageEvent) {
        // @TODO: Validate the origin
        // if (event.origin !== this.targetOrigin) {
        //     // eslint-disable-next-line no-console
        //     console.warn('Message from untrusted origin:', event.origin);
        //     return;
        // }

        const data = event.data as MessageData;

        // Ensure the message has the correct structure
        if (!data || typeof data.type !== 'string' || !('payload' in data)) {
            return;
        }

        logger.info('NEW CHANNEL EVENT', event.data);

        // Invoke all listeners for the specific event type
        const { type, payload } = data;
        if (this.listeners.has(type)) {
            this.listeners.get(type)?.forEach((callback) => callback(payload));
        }
    }
}
