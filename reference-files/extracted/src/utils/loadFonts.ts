import { CustomChartContext, TSFontFace } from '@thoughtspot/ts-chart-sdk';
import { waitOnLinkElementLoaded } from '.';

export async function loadFonts(ctx: CustomChartContext) {
    let fontFacesCSS = '';

    const styleConfig = ctx.getAppConfig()?.styleConfig;
    const chartFeatureToFontGuid = styleConfig?.chartFeatureToFontGuid;
    const fontFaces = styleConfig?.fontFaces;
    const selectedCustomFont = fontFaces?.find((font) => font.guid === chartFeatureToFontGuid?.[0]);

    if (fontFaces) {
        const head = document.getElementsByTagName('head')[0];

        fontFacesCSS = await appendFontLinks(fontFaces, head, fontFacesCSS);
        fontFacesCSS += `* {
            font-family: '${
                selectedCustomFont ? selectedCustomFont.family : fontFaces[0].family
            }', 'helvetica neue', 'helvetica', 'arial', 'sans-serif' !important;
        }`;

        const style = document.createElement('style');
        style.appendChild(document.createTextNode(fontFacesCSS));
        head.appendChild(style);
    }
    return fontFacesCSS;
}

async function appendFontLinks(fontFaces: Array<TSFontFace>, head: HTMLHeadElement, fontFacesCSS: string) {
    for (let i = 0; i < fontFaces.length; i += 1) {
        const font = fontFaces[i];
        if (font) {
            const link = createLinkElement(font);
            head.appendChild(link);
            await waitOnLinkElementLoaded(link);
            fontFacesCSS += createFontFaceCSS(font);
        }
    }
    return fontFacesCSS;
}

function createLinkElement(font: TSFontFace) {
    const { url, extension } = getFontInfo(font);

    const link = document.createElement('link');
    link.rel = 'preload';
    link.type = `font/${extension}`;
    link.href = url;
    link.as = 'font';
    link.crossOrigin = 'anonymous';

    return link;
}

function createFontFaceCSS(font: TSFontFace) {
    const { url, fontFormat } = getFontInfo(font);

    let css = `@font-face {
        font-family: '${font.family}';
        src: url('${url}') format('${fontFormat}');
        font-weight: ${font.weight};
        font-style: ${font.style};
        font-display: swap;
    }`;

    css += `\n \n`;

    return css;
}

function getFontInfo(font: TSFontFace) {
    const url = font.url || '';
    const extension =
        font.guid && font.guid !== null && font.format
            ? font.format.toLowerCase()
            : url
                  ?.split('.')
                  ?.pop()
                  ?.toLowerCase();

    let fontFormat;
    if (extension === 'woff') {
        fontFormat = 'woff';
    } else if (extension === 'woff2') {
        fontFormat = 'woff2';
    } else if (extension === 'ttf') {
        fontFormat = 'truetype';
    } else if (extension === 'otf') {
        fontFormat = 'opentype';
    } else if (extension === 'svg') {
        fontFormat = 'svg';
    } else {
        fontFormat = font.format; // Fallback to the provided format if unknown
    }

    return { url, extension, fontFormat };
}
