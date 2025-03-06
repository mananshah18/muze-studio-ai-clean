import { resolveImportResourceUrl, waitOnLinkElementLoaded } from '.';

export async function loadSingleCssURL(cssResourcePath: string) {
    if (!cssResourcePath) return;

    const resolvedURL = await resolveImportResourceUrl(cssResourcePath, 'text/css');

    const body = document.getElementsByTagName('body')[0];
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = resolvedURL;

    body.appendChild(link);

    await waitOnLinkElementLoaded(link);
}
