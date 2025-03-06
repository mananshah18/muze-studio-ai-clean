import { byIdOrThrow, resolveImportResourceUrl } from '../utils';

// @TODO: Implement it with proper font CDN URL.
export function getOptimoFontFaceCdnUrl() {
    const linkElem = byIdOrThrow('fonts-style-link') as HTMLLinkElement;
    return linkElem.href;
}

// @TODO: Use the CDN based approach to load the dyoc sdk, otherwise this will load
// the latest dyoc sdk version which might break the old DYOC charts.
// This is being tracked here: https://thoughtspot.atlassian.net/browse/SCAL-236523
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getDYOCSDKCdnUrls(version: string) {
    const resolvedJsUrl = await resolveImportResourceUrl(
        // eslint-disable-next-line compat/compat
        new URL('../dyocsdk/dist/dyocsdk.mjs', import.meta.url).pathname,
        'text/javascript',
    );

    const resolvedCssUrl = await resolveImportResourceUrl(
        // eslint-disable-next-line compat/compat
        new URL('../dyocsdk/dist/dyocsdk.css', import.meta.url).pathname,
        'text/css',
    );

    return {
        js: resolvedJsUrl,
        css: resolvedCssUrl,
    };
}
