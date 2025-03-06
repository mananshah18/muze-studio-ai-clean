import './styles.css';
import { IframeCommunicationChannel } from '../comm';
import { ChannelEvent } from '../comm/types';
import { initLogger, logger } from '../logger';
import { buildSDKAPI } from './api';
import { SDKInitData } from './types';

export default function DYOCSDK(initData: SDKInitData) {
    initLogger(!!initData.tsSystemInfo.isDebugMode);

    const commChannel = new IframeCommunicationChannel();

    logger.info('Iframe Received Init data', initData);

    document.addEventListener('click', async () => {
        commChannel.emit(ChannelEvent.HideAllContextMenus, null, window.parent);
    });

    const sdkAPI = buildSDKAPI({
        data: initData.data,
        schema: initData.schema,
        tsSystemInfo: initData.tsSystemInfo,
        commChannel,
    });

    return sdkAPI;
}
