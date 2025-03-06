import { Base64 } from 'js-base64';
import _ from 'lodash';
import { logger } from '../logger';

export function safeMerge<T>(target: T, ...sources: T[]): T {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return _.mergeWith(target, ...sources, (targetValue: any, srcValue: any) => {
        if (Array.isArray(targetValue) && Array.isArray(srcValue)) {
            return srcValue;
        }
        return undefined;
    });
}

export function waitOnLinkElementLoaded(link: HTMLLinkElement): Promise<boolean> {
    let resolveFn: ((value: boolean | PromiseLike<boolean>) => void) | null = null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let rejectFn: ((reason?: any) => void) | null = null;

    link.onload = () => {
        resolveFn?.(true);
        logger.info(`Link is loaded, href: ${link.href}`);
    };

    link.onerror = (evt) => {
        rejectFn?.(evt);
        logger.info(`Link loading error, href: ${link.href}, error: ${evt}`);
    };

    // eslint-disable-next-line compat/compat
    return new Promise((resolve, reject) => {
        resolveFn = resolve;
        rejectFn = reject;
    });
}

export function byIdOrThrow(id: string): HTMLElement {
    const elem = document.getElementById(id);
    if (!elem) {
        throw new Error(`Couldn't found element with id: ${id}`);
    }

    return elem;
}

export async function resolveImportResourceUrl(resourcePath: string, mimeType: string): Promise<string> {
    let resolvedURL: string;

    if (resourcePath.startsWith(`data:${mimeType}`)) {
        resolvedURL = resourcePath;
    } else if (resourcePath.startsWith(mimeType)) {
        resolvedURL = `data:${resourcePath}`;
    } else {
        resolvedURL = import.meta.resolve ? await import.meta.resolve(resourcePath) : resourcePath;
    }

    return resolvedURL;
}

export function encodeBase64(value: string): string {
    return Base64.encode(value);
}

export function decodeBase64(value: string): string {
    return Base64.decode(value);
}
