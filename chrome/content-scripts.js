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

function dispatchKeyEventToPresenDocument(keyCode) {
    const target = presenDocument();
    if (target) {
        const keydown = new KeyboardEvent("keydown", { keyCode });
        target.dispatchEvent(keydown);
    }
}

let ws;

chrome.runtime.onMessage.addListener((request) => {
    console.log("A message has been arrived from popup:", request.command);

    if (request.command === "connect") {
        // もしWebSocket接続があるなら接続を切る
        if (ws) {
            console.debug("Close an existing websocket connection");
            ws.close();
        }

        chrome.storage.local.get("backend_url", ({ backend_url }) => {
            // スキーマ（http or https）を除いてws or wssを付ける
            const pos = "http".length;
            const ws_url = `ws${backend_url.slice(pos)}/room/${request.room_id}`;
            console.debug("Connect to", ws_url);

            ws = new WebSocket(ws_url);
            ws.addEventListener("close", () => {
                console.debug(`The websocket connection to ${ws_url} is closed`);
            });
            ws.addEventListener("message", (event) => {
                const data = JSON.parse(event.data);
                console.debug("A message has been arrived:", data);
                if (data.direction === "prev") {
                    dispatchKeyEventToPresenDocument(37); // ArrowLeft
                } else if (data.direction === "next") {
                    dispatchKeyEventToPresenDocument(39); // ArrowRight
                }
            });
        });
    } else if (request.command === "disconnect") {
        if (ws) {
            console.debug("The websocket connection is closed manually");
            ws.close();
        }
    }
});
