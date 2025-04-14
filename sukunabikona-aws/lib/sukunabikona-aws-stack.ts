import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { ParamsAndSecretsLayerVersion, ParamsAndSecretsVersions } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";

const paramsAndSecretsArns = {
    'ap-northeast-1': 'arn:aws:lambda:ap-northeast-1:133490724326:layer:AWS-Parameters-and-Secrets-Lambda-Extension:12',
} as { [key: string]: string };

export class SukunabikonaAwsStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const region = props?.env?.region || '';
        const paramsAndSecrets = ParamsAndSecretsLayerVersion.fromVersionArn(paramsAndSecretsArns[region]);
        if (paramsAndSecrets == undefined) {
            throw new Error('The required values are missing.');
        }

        const apiKey = StringParameter.fromSecureStringParameterAttributes(this, 'ApiKey', {
            parameterName: '/perplexity/apikey',
        });
        const perplexityApi = new NodejsFunction(this, 'PerplexityApi', {
            entry: `${__dirname}/functions/perplexity-api.ts`,
            paramsAndSecrets: paramsAndSecrets,
        });
        apiKey.grantRead(perplexityApi);

        new CfnOutput(this, 'PerplexityApiFunctionName', { value: perplexityApi.functionName });
    }
}
