// Googleスライドのプレゼンテーションモードでは
// classがpunch-present-iframeのiframeタグがフルスクリーン化されている。
// そのiframeのcontentDocumentにKeyboardEventをdispatchすると
// スライドのページが変わる。
function presenDocument() {
    const fullscreenIframes = document.getElementsByClassName("punch-present-iframe");
    if (fullscreenIframes.length < 1) {
        return undefined;
    }
    const fullscreenIframe = fullscreenIframes[0];
    if (fullscreenIframe) {
        return fullscreenIframe.contentDocument;
    } else {
        return undefined;
    }
}

function dispatchKeyEventToPresen(keyCode) {
    const target = presenDocument();
    if (target) {
        const keydown = new KeyboardEvent("keydown", { keyCode });
        target.dispatchEvent(keydown);
    }
}

