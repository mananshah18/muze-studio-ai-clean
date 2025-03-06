import { byIdOrThrow, resolveImportResourceUrl } from '../utils';
export function getOptimoFontFaceCdnUrl() {
    const linkElem = byIdOrThrow('fonts-style-link');
    return linkElem.href;
}
export async function getDYOCSDKCdnUrls(version) {
    const resolvedJsUrl = await resolveImportResourceUrl(new URL('../dyocsdk/dist/dyocsdk.mjs', import.meta.url).pathname, 'text/javascript');
    const resolvedCssUrl = await resolveImportResourceUrl(new URL('../dyocsdk/dist/dyocsdk.css', import.meta.url).pathname, 'text/css');
    return {
        js: resolvedJsUrl,
        css: resolvedCssUrl,
    };
}
//# sourceMappingURL=helpers.js.map