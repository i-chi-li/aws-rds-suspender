import * as cdk from "@aws-cdk/core";
import * as iam from "@aws-cdk/aws-iam";
import * as lambdaNodejs from "@aws-cdk/aws-lambda-nodejs";
import * as logs from "@aws-cdk/aws-logs";
import * as rds from "@aws-cdk/aws-rds";
import * as sns from "@aws-cdk/aws-sns";
import * as snsSubscriptions from "@aws-cdk/aws-sns-subscriptions";

/**
 * RDS クラスタ自動停止スタック
 */
export class AwsRdsSuspenderStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Lambda 関数
        const lambda = new lambdaNodejs.NodejsFunction(this, "RdsSuspendFunction", {
            description: "RDS クラスタ自動停止関数",
            logRetention: logs.RetentionDays.THREE_DAYS,
            initialPolicy: [
                new iam.PolicyStatement({
                    actions: ["rds:*"],
                    resources: ["*"]
                })
            ]
        });

        // SNS トピック
        const topic = new sns.Topic(this, "RdsEventTopic", {displayName: "RDS Cluster Event Topic"});
        topic.addSubscription(new snsSubscriptions.LambdaSubscription(lambda));

        // 停止対象 RDS クラスタ名リスト
        // 未指定の場合は、すべての RDS クラスタとなる
        const sourceIds: string[] | undefined = this.node.tryGetContext("db-names")?.split(",");

        // RDS イベントサブスクリプション
        new rds.CfnEventSubscription(this, "RdsEventSubscription", {
            snsTopicArn: topic.topicArn,
            eventCategories: ["notification"],
            sourceType: "db-cluster",
            sourceIds: sourceIds
        });
    }
}
