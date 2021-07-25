// 有効ボタン
let switchForEnable = document.getElementById("switchForEnable");

// 有効ボタンの初期状態の設定
chrome.storage.sync.get("isEnabled", ({ isEnabled }) => {
    if (isEnabled) {
        switchForEnable.checked = true;
    } else {
        switchForEnable.checked = false;
    }
});

// actionのlistenerと有効状態をsyncさせたいので
// sotrage APIを使う
switchForEnable.addEventListener("change", () => {
    if (switchForEnable.checked) {
        chrome.storage.sync.set({ isEnabled: true });
    } else {
        chrome.storage.sync.set({ isEnabled: false });
    }
});
