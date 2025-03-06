import { logger } from '../logger';
export class IframeCommunicationChannel {
    listeners;
    constructor() {
        this.listeners = new Map();
        window.addEventListener('message', this.handleMessage.bind(this));
    }
    on(type, callback) {
        if (!this.listeners.has(type)) {
            this.listeners.set(type, []);
        }
        this.listeners.get(type)?.push(callback);
    }
    once(type, callback) {
        const wrapper = (payload) => {
            callback(payload);
            this.off(type, wrapper);
        };
        this.on(type, wrapper);
    }
    off(type, callback) {
        if (this.listeners.has(type)) {
            const callbacks = this.listeners.get(type)?.filter((cb) => cb !== callback);
            callbacks && this.listeners.set(type, callbacks);
        }
    }
    emit(type, payload, targetWindow) {
        const message = { type, payload };
        targetWindow.postMessage(message);
    }
    handleMessage(event) {
        const data = event.data;
        if (!data || typeof data.type !== 'string' || !('payload' in data)) {
            return;
        }
        logger.info('NEW CHANNEL EVENT', event.data);
        const { type, payload } = data;
        if (this.listeners.has(type)) {
            this.listeners.get(type)?.forEach((callback) => callback(payload));
        }
    }
}
//# sourceMappingURL=index.js.map