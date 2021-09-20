const backend_url = "http://localhost:8000";

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ backend_url });
});

// 動作確認のために、コマンドをフックにtoPrevPageやtoNextPageを呼び出す
chrome.commands.onCommand.addListener((command, tab) => {
    // chrome://で始まるページは設定などの特殊なページで、
    // executeScriptができない（はず）
    if (!tab || tab.url.startsWith('chrome://')) { return; }
    chrome.storage.local.get("isEnabled", ({ isEnabled }) => {
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
        } else if (command === "fetch_room") {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: fetchRoom
            });
        }
    });
});


function fetchRoom() {
    const base_url = "http://localhost:8000";

    fetch(base_url + "/room", {method: "POST"})
        .then(response => response.json())
        .then(data => console.log(data));
}

function toPrevPage() {
    dispatchKeyEventToPresen(37); // ArrowLeft
}

function toNextPage() {
    dispatchKeyEventToPresen(39); // ArrowRight
}
