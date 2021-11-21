# chrome拡張機能

google slidesのプレゼンテーションモードのページ送りを、遠隔から行うことが可能なchrome拡張機能


## 単語

* ホスト
    * google slidesをプレゼンテーションモードにするユーザ
    * 利用するバックエンドの選択、部屋の作成・削除、クライアントへの部屋番号の通知などを行う
* クライアント
    * ホストがプレゼンテーションモードにしているgoogle slidesを遠隔から操作するユーザ
    * ホストから通知された部屋番号を用いて、任意のタイミングで、ページ送り等を行う
* 部屋
    * 部屋番号で一意に識別される
    * 部屋ごとにホストが一人存在する
* バックエンド
    * http、websocket通信等を用いて、ユーザからのリクエストに応じて部屋の作成・削除、google slidesの遠隔操作等を行う

## ユースケース

オンライン会議等で、ホストがgoogle slidesのプレゼンを画面共有し、多数のクライアントがページ送りを任意に行う

## ファイル構成

* manifest.json
* background.*
    * chromeが起動している間、動作し続けるスクリプト
* content-scripts.**
    * ブラウザに表示されているページのDOM操作を行うスクリプト
    * websocketを用いた通信とgoogle slidesのページ送りを行う
* popup.*
    * popupの表示や処理
    * 部屋の作成・削除や通信を、ユーザ起因のイベント発火で実行


```
├── README.md
├── background.js
├── content-scripts.js
├── images
│   ├── icon128.png
│   ├── icon16.png
│   ├── icon32.png
│   └── icon48.png
├── manifest.json
├── popup.css
├── popup.html
└── popup.js
```

