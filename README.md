# RDS クラスタ自動停止 CDK プロジェクト
このプロジェクトは、指定した RDS クラスタが起動したイベントで
即座に RDS クラスタを停止する CDK プロジェクトとなる。
RDS クラスタ起動イベントでのみ起動するため、
既に起動中の RDS クラスタは停止しない。


## 制限事項
このプロジェクトは、以下の制限事項がある。
- Aurora クラスタでのみ動作確認をしている。
- CDK の実行は、Docker が利用できる環境上でのみ実行できる。
- 停止動作は、2 回ほど失敗する。起動完了イベント発生時には、まだ停止できる状態になっていないのが原因のようだ。

Windows の場合は、
[Docker Machine](https://docs.docker.jp/machine/index.html)
を導入するだけでは、CDK を実行できない。
理由は、CDK ソースで利用している、NodejsFunction クラスは、
Node.js ソースを Docker 上でトランスパイルするため、
ローカル環境のディレクトリを Docker ボリュームとしてマウントする。
その際に、Windows と Linux でのディレクトリパスの形式が、
異なるため、マウントに失敗する。

したがって、Windows の場合には、Docker in Docker などの手法で、
CDK を実行する必要がある。

以後の説明は、Docker Machine を Windows にインストール済みの前提とする。


## Docker in Docker 手法について
Docker in Docker とは、Docker コンテナ内で、
Docker を利用する手法となる。
この手法には、幾つかの実現方法があるが、
ここでは、Docker コンテナ内から、Docker ホストの
Docker ソケットを利用できるように設定する方法とする。

まず前提知識として、Windows 上に Docker Machine をインストールするには、
VirtualBox が必要となる。
Docker ホストは、VirtualBox 上の仮想環境として動作する。
この仮想環境は、Docker Machine インストール時に、
Windows との共有ディレクトリとして `c:\Users` が、設定されている。
したがって、本プロジェクトの格納ディレクトリは、
共有ディレクトリか、その子階層に配置する必要がある。
ただし、共有ディレクトリの設定は、任意に変更できる。
設定方法は、
[VirtualBox 仮想環境の共有ディレクトリ設定方法](#VirtualBox-仮想環境の共有ディレクトリ設定方法)
を参照。


### Docker イメージを構築する
プロジェクトルートで、以下のコマンドを実行する。
```
docker build -t self/docker-custom .
```


### Docker コンテナを起動する
`foo1` は、Windows のログインユーザ名に変更すること。
`/D/programs/aws-rds-suspender` は、本プロジェクトを配置したディレクトリを指定すること。
その際に、指定するディレクトリは、Docker ホスト仮想環境のディレクトリであることに注意すること。
```
docker run --name infra -itd ^
--mount type=bind,source=/C/Users/foo1/.aws,target=/root/.aws ^
--mount type=bind,source=/D/programs/aws-rds-suspender,target=/D/programs/aws-rds-suspender ^
self/aws-rds-suspender
```


### VirtualBox 仮想環境の共有ディレクトリ設定方法
- Oracle VM VirtualBox マネージャーを開く。
- Docker Machine で作成した仮想環境（デフォルトでは、`default`）を選択。
- 共有フォルダー設定を開く。
- 共有フォルダーを追加する
  - フォルダーのパス：CDK プロジェクトを配置したディレクトリか、
    それより親階層を指定する。（例：D:\programs）
  - フォルダー名：任意のフォルダー名を指定する。
    ここでは、フォルダーのパスに合わせた Linux 形式を指定する。（例：D/programs）
  - 読み込み専用：チェックしない
  - 自動マウント：チェックする
  - マウントポイント：空欄とする
  - 永続化する：チェックする
- Docker Machine を再起動する。
  - `docker-machine restart`

Docker ホストに接続する。
以下のような接続方法がある。
- `docker-machine ssh`
- Docker Machine へ SSH で接続する。
  - Docker Machine の IP は、以下のコマンドで調べられる。
    - `docker-machine ip`
  - 接続に必要な SSH プライベートキーは、`%USERPROFILE%\.docker\machine\machines\default\id_rsa` を利用する。


## プロジェクトのデプロイ方法
AWS 接続用のプロファイルは設定済みとする。
プロジェクトルートで、以下のコマンドを実行する。
`-c db-names=` に指定する値は、RDS データベースクラスタ名に変更する
RDS データベースクラスタ名は、カンマ区切りで複数指定可能。
`-c db-names=` を指定しない場合は、すべての RDS データベースクラスタが停止対象となる。
```
npm install
npm run build
AWS_PROFILE=<profileName> npx cdk -c db-names=db1,db2 deploy AwsRdsSuspenderStack
```
