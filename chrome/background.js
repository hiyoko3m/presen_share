chrome.runtime.onInstalled.addListener(() => {
    const backend_url = "http://localhost:8000";

    chrome.storage.local.set({ backend_url });

    chrome.storage.local.remove(["connecting_tab", "host_room_id"]);
});

