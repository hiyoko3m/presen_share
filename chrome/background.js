// 初期状態では機能は無効に設定する
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ isEnabled: false });
});

// 動作確認のために、コマンドをフックにtoPrevPageやtoNextPageを呼び出す
chrome.commands.onCommand.addListener((command, tab) => {
    // chrome://で始まるページは設定などの特殊なページで、
    // executeScriptができない（はず）
    if (!tab || tab.url.startsWith('chrome://')) { return; }
    chrome.storage.sync.get("isEnabled", ({ isEnabled }) => {
        if (!isEnabled) { return; }

        if (command === "previous_page") {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: toPrevPage
            });
        } else if (command === "next_page") {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: toNextPage
            });
        }
    });
});


function toPrevPage() {
    const target = presenDocument();
    if (target) {
        const keydown = new KeyboardEvent("keydown", { keyCode: 37 }); // ArrowLeft
        target.dispatchEvent(keydown);
    }

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
}

function toNextPage() {
    const target = presenDocument();
    if (target) {
        const keydown = new KeyboardEvent("keydown", { keyCode: 39 }); // ArrowNext
        target.dispatchEvent(keydown);
    }

    // toPrevPage内のpresenDocumentと同じ関数。
    // toPrevPageやtoNextPageはtabのコンテキストで実行されるので、
    // presenDocumentをbackground.jsのトップレベルに置くと認識されない。
    // tabがactiveになったときにpresenDocumentの定義を流し込む、
    // のような処理ができれば関数定義を重複させなくてよいのだが、
    // やり方が分からない。
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
}
