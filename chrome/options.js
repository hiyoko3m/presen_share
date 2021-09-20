let url_input = document.getElementById("url");
let update_button = document.getElementById("update")

chrome.storage.local.get("backend_url", (data) => {
    let url = data.backend_url;
    console.log(url);
    url_input.value = url;
})

update_button.addEventListener("click", () => {
    let backend_url = url_input.value;
    chrome.storage.local.set({ backend_url });
})
