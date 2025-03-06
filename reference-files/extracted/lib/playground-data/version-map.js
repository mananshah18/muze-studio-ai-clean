import { buildDataAndSchema } from '../data';
import { extractColorPallettes } from '../helpers';
import { logger } from '../logger';
import { getDYOCSDKCdnUrls, getOptimoFontFaceCdnUrl } from './helpers';
import { PlaygroundVersion } from './types';
export const PLAYGROUND_VERSION_DATA_MAP = new Map([
    [
        PlaygroundVersion.V1,
        async (ctx) => {
            const chartModel = ctx.getChartModel();
            const appConfig = ctx.getAppConfig();
            const sdkCdnUrls = await getDYOCSDKCdnUrls('1.0.0');
            logger.info(`DYOC SDK IMPORT URLs: js: ${sdkCdnUrls.js}, css: ${sdkCdnUrls.css}`);
            const systemInfo = {
                isDebugMode: !!appConfig.appOptions?.isDebugMode,
                isLiveboardContext: !!appConfig.appOptions?.isLiveboardContext,
                isMobile: !!appConfig.appOptions?.isMobile,
                isPrintMode: !!appConfig.appOptions?.isPrintMode,
                colorPallettes: extractColorPallettes(ctx).map((c) => c.primaryColor),
            };
            const { schema, data } = buildDataAndSchema(chartModel);
            const pgData = {
                version: PlaygroundVersion.V1,
                dyocSDK: {
                    jsCdnUrl: sdkCdnUrls.js,
                    cssCdnUrl: sdkCdnUrls.css,
                    initData: {
                        data,
                        schema,
                        tsSystemInfo: systemInfo,
                    },
                    sdkKey: 'viz',
                },
                font: {
                    fontFamily: `'optimo-plain', 'helvetica neue', 'helvetica', 'arial', 'sans-serif'`,
                    fontsCdnUrl: getOptimoFontFaceCdnUrl(),
                },
            };
            return pgData;
        },
    ],
]);
//# sourceMappingURL=version-map.js.map