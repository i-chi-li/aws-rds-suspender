import * as aws from "aws-sdk";
import * as lambdaEvents from "aws-lambda";

// {
//     "Event Source": "db-cluster",
//     "Event Time": "2020-10-05 06:11:49.443",
//     "Identifier Link": "https://console.aws.amazon.com/rds/home?region=ap-northeast-1#dbclusters:id=dev-oplux-v3",
//     "Source ID": "dev-oplux-v3",
//     "Source ARN": "arn:aws:rds:ap-northeast-1:141587088046:cluster:dev-oplux-v3",
//     "Event ID": "http://docs.amazonwebservices.com/AmazonRDS/latest/UserGuide/USER_Events.html#RDS-EVENT-0151",
//     "Event Message": "DB cluster started"
// }

/**
 * RDS イベントメッセージ
 */
interface RdsEventMessage {
    "Event Source": string;
    "Event Time": string;
    "Identifier Link": string;
    "Source ID": string;
    "Source ARN": string;
    "Event ID": string;
    "Event Message": string;
}

/**
 * RDS クライアント
 */
const rdsClient = new aws.RDS();

/**
 * ハンドラ
 *
 * @param event SNS イベント
 */
export async function handler(
    event: lambdaEvents.SNSEvent
): Promise<void> {
    for (const record of event.Records) {
        console.debug(`SNS Event Record: ${JSON.stringify(record, undefined, 2)}`);

        const message: RdsEventMessage = JSON.parse(record.Sns.Message) as RdsEventMessage;
        console.debug(`SNS Message: ${JSON.stringify(message, undefined, 2)}`);

        if (message["Event ID"].endsWith("RDS-EVENT-0151")) {
            // DB クラスタ開始イベントの場合

            // RDS クラスタを停止する
            await rdsClient.stopDBCluster({
                DBClusterIdentifier: message["Source ID"]
            }).promise()
                .then(result => {
                    console.debug(`stopDBCluster Response: ${JSON.stringify(result, undefined, 2)}`);
                })
                .catch(reason => {
                    throw reason;
                });
        }
    }
}
