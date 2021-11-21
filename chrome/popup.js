// バックエンドのURL
let backend_url = document.getElementById("backend-url");
// バックエンドのURLの更新ボタン
let backend_url_update_button = document.getElementById("backend-url-update-button");
// ホスト部屋ID
let host_room_id_input = document.getElementById("host-room-id");
// 部屋作成
let create_room_button = document.getElementById("create-room");
// リセット
let reset_room_button = document.getElementById("reset-room");
// 接続開始
let connect_button = document.getElementById("connect");

// status table
// ユーザ起因のイベントで、popupに表示するステータス変更用
let status_table_backend_url = document.getElementById("status-table-backend-url");
let status_table_host_room_number = document.getElementById("status-table-host-room-number");
let status_table_host_is_connected = document.getElementById("status-table-host-is-connected");
let status_table_client_room_number = document.getElementById("status-table-client-room-number");
let status_table_client_is_connected = document.getElementById("status-table-client-is-connected");

chrome.storage.local.get("host_room_id", ({ host_room_id }) => {
    if (host_room_id) {
        host_room_id_input.value = host_room_id;
        on_room_existence(host_room_id);
    }
});

reset_room_button.addEventListener("click", () => {
    chrome.storage.local.get("connecting_tab", ({ connecting_tab }) => {
        if (connecting_tab) {
            disconnect(connecting_tab);
        }
    });

    chrome.storage.local.remove("host_room_id");
    host_room_id_input.value = "";
    on_room_nonexistence();
})

// 部屋IDがあるときのボタンにする
function on_room_existence(room_id) {
    create_room_button.setAttribute("disabled", "");
    reset_room_button.removeAttribute("disabled");
    connect_button.removeAttribute("disabled");
    status_table_host_room_number.innerHTML = room_id;
    // todo: 新規作成時以外、websocket connectionが生きているかcheckが必要
    // status_table_host_is_connected.innerHTML = 'yes';
}

// 初期状態時のボタンにする
function on_room_nonexistence() {
    create_room_button.removeAttribute("disabled");
    reset_room_button.setAttribute("disabled", "");
    connect_button.setAttribute("disabled", "");
    status_table_host_room_number.innerHTML = "";
    status_table_host_is_connected.innerHTML = "no";
}

create_room_button.addEventListener("click", () => {
    chrome.storage.local.get("backend_url", ({ backend_url }) => {
        fetch(`${backend_url}/room`, { method: "POST"})
            .then(response => response.json())
            .then(data => {
                let room_id = data.room_id;

                chrome.storage.local.set({ host_room_id: room_id });
                host_room_id_input.value = room_id;

                on_room_existence(room_id);
            })
            .catch(error => {
                console.error("fetch error: ", error);
            })
    });
})

connect_button.addEventListener("click", () => {
    chrome.storage.local.get("connecting_tab", ({ connecting_tab }) => {
        if (!connecting_tab) {
            connect();
        } else {
            disconnect(connecting_tab);
        }
    });
})

function connect() {
    // 本当はいったんボタンを無効にしておいて、
    // messageのlistenerのほうでpromiseを使い、
    // 処理が終わったらその結果次第でボタンの状態を変えて有効化するのが
    // いいと思う。disconnectも同じ
    let queryOptions = { active: true, currentWindow: true };
    chrome.tabs.query(queryOptions, (tabs) => {
        if (tabs.length >= 1) {
            chrome.storage.local.set({ connecting_tab: tabs[0].id });
            update_connect_button();

            chrome.tabs.sendMessage(tabs[0].id, { command: "connect", room_id: host_room_id_input.value });
        }
    })
}

function disconnect(tab_id) {
    chrome.storage.local.remove("connecting_tab");
    update_connect_button();

    chrome.tabs.sendMessage(tab_id, { command: "disconnect" });
}

// connecting_tabのonchange listenerに登録するほうがいい
function update_connect_button() {
    chrome.storage.local.get("connecting_tab", ({ connecting_tab }) => {
        if (connecting_tab) {
            connect_button.innerText = "接続切断";
            status_table_host_is_connected.innerHTML = "yes";
        } else {
            connect_button.innerText = "接続開始";
            status_table_host_is_connected.innerHTML = "no";
        }
    });
}

update_connect_button();

// クライアント部屋ID
let client_room_id_input = document.getElementById("client-room-id");
// 前へ
let prev_button = document.getElementById("prev");
// 次へ
let next_button = document.getElementById("next");

prev_button.addEventListener("click", () => {
    operate_slide("prev");
})

next_button.addEventListener("click", () => {
    operate_slide("next");
})

function operate_slide(dir) {
    let room_id = client_room_id_input.value;
    status_table_client_room_number.innerHTML = room_id;

    chrome.storage.local.get("backend_url", ({ backend_url }) => {
        fetch(`${backend_url}/room/${room_id}/${dir}`, { method: "POST"})
            .then(response => {
                console.log(response.ok);
                if (!response.ok) {
                    status_table_client_is_connected.innerHTML = "no";
                    throw new Error(`${dir} button error`);
                } else {
                    status_table_client_is_connected.innerHTML = "yes";
                }
            })
            .catch(error => {
                status_table_client_is_connected.innerHTML = "no";
                console.error("fetch error: ", error);
            })
    });
}

function escapeHTML(string){
    return string.replace(/&/g, '&lt;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, "&#x27;");
}

chrome.storage.local.get("backend_url", (data) => {
    let url = data.backend_url;
    console.log(url);
    backend_url.value = url;
    status_table_backend_url.innerHTML = escapeHTML(url);
})


// todo: 変更時にホスト、クライアントの状態のリフレッシュが必要
backend_url_update_button.addEventListener("click", () => {
    let url = backend_url.value;
    chrome.storage.local.set({ url });
    status_table_backend_url.innerHTML = escapeHTML(url);
})
