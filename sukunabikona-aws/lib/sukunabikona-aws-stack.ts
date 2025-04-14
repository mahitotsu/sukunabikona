import { CfnOutput, Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { LoggingFormat, ParamsAndSecretsLayerVersion } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { LogGroup, RetentionDays } from "aws-cdk-lib/aws-logs";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";

const paramsAndSecretsArns = {
    'ap-northeast-1': 'arn:aws:lambda:ap-northeast-1:133490724326:layer:AWS-Parameters-and-Secrets-Lambda-Extension:12',
} as { [key: string]: string };

export class SukunabikonaAwsStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const region = props?.env?.region || '';
        const paramsAndSecretsExtension = ParamsAndSecretsLayerVersion.fromVersionArn(paramsAndSecretsArns[region]);
        if (paramsAndSecretsExtension == undefined) {
            throw new Error('The required values are missing.');
        }

        const apiKey = StringParameter.fromSecureStringParameterAttributes(this, 'ApiKey', {
            parameterName: '/perplexity/apikey',
        });
        const perplexityApi = new NodejsFunction(this, 'PerplexityApi', {
            entry: `${__dirname}/functions/perplexity-api.ts`,
            memorySize: 1024,
            timeout: Duration.seconds(60),
            paramsAndSecrets: paramsAndSecretsExtension,
            loggingFormat: LoggingFormat.JSON,
            logGroup: new LogGroup(this, 'LogGroup', {
                retention: RetentionDays.ONE_DAY,
                removalPolicy: RemovalPolicy.DESTROY,
            }),
        });
        apiKey.grantRead(perplexityApi);

        new CfnOutput(this, 'PerplexityApiFunctionName', { value: perplexityApi.functionName });
    }
}
