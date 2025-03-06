import { Base64 } from 'js-base64';
import _ from 'lodash';
import { logger } from '../logger';
export function safeMerge(target, ...sources) {
    return _.mergeWith(target, ...sources, (targetValue, srcValue) => {
        if (Array.isArray(targetValue) && Array.isArray(srcValue)) {
            return srcValue;
        }
        return undefined;
    });
}
export function waitOnLinkElementLoaded(link) {
    let resolveFn = null;
    let rejectFn = null;
    link.onload = () => {
        resolveFn?.(true);
        logger.info(`Link is loaded, href: ${link.href}`);
    };
    link.onerror = (evt) => {
        rejectFn?.(evt);
        logger.info(`Link loading error, href: ${link.href}, error: ${evt}`);
    };
    return new Promise((resolve, reject) => {
        resolveFn = resolve;
        rejectFn = reject;
    });
}
export function byIdOrThrow(id) {
    const elem = document.getElementById(id);
    if (!elem) {
        throw new Error(`Couldn't found element with id: ${id}`);
    }
    return elem;
}
export async function resolveImportResourceUrl(resourcePath, mimeType) {
    let resolvedURL;
    if (resourcePath.startsWith(`data:${mimeType}`)) {
        resolvedURL = resourcePath;
    }
    else if (resourcePath.startsWith(mimeType)) {
        resolvedURL = `data:${resourcePath}`;
    }
    else {
        resolvedURL = import.meta.resolve ? await import.meta.resolve(resourcePath) : resourcePath;
    }
    return resolvedURL;
}
export function encodeBase64(value) {
    return Base64.encode(value);
}
export function decodeBase64(value) {
    return Base64.decode(value);
}
//# sourceMappingURL=index.js.map