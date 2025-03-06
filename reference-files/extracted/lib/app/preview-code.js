export function generatePreviewCode(pgData, jsCode, cssCode, htmlCode) {
    return `
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">

                <link href="${pgData.font.fontsCdnUrl}" rel="stylesheet">
                <style>
                    #muze-layout-container-1 * {
                        font-family: ${pgData.font.fontFamily} !important;
                        font-size: 11px !important;
                    }
                </style>

                <link rel="stylesheet" href="${pgData.dyocSDK.cssCdnUrl}">
                <style>${cssCode}</style>
            </head>
            <body>
                ${htmlCode}
                <script>
                    // Disable dialogs
                    window.alert = function() {};
                    window.confirm = function() { return true; };
                    window.prompt = function() { return null; };
                    window.print = function() {};

                    // Disable file system access
                    window.showOpenFilePicker = function() {};
                    window.showSaveFilePicker = function() {};
                    window.showDirectoryPicker = function() {};
                    window.showModal = function() {};

                    // Disable window manipulation
                    window.open = function() { return null; };
                    window.close = function() {};
                    window.moveTo = function() {};
                    window.resizeTo = function() {};

                    // Disable potentially dangerous APIs
                    window.requestFullscreen = function() {};
                    document.requestFullscreen = function() {};
                    window.localStorage.clear();
                    window.sessionStorage.clear();
                </script>
                <script type="module">
                    import ___DYOCSDK___ from "${pgData.dyocSDK.jsCdnUrl}";
                    window["${pgData.dyocSDK.sdkKey}"] = ___DYOCSDK___(${JSON.stringify(pgData.dyocSDK.initData)});

                    (() => {
                        ${jsCode}
                    })();
                </script>
            </body>
        </html>
    `;
}
//# sourceMappingURL=preview-code.js.map