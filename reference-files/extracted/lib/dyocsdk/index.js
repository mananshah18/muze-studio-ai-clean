import './styles.css';
import { IframeCommunicationChannel } from '../comm';
import { ChannelEvent } from '../comm/types';
import { initLogger, logger } from '../logger';
import { buildSDKAPI } from './api';
export default function DYOCSDK(initData) {
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
//# sourceMappingURL=index.js.map