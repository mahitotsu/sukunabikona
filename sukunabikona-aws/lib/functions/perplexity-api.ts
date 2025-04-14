import { Handler } from "aws-lambda";
import { URLSearchParams } from "url";

const paramsAndSecretsUrl = 'http://localhost:2773/systemsmanager/parameters/get';
const perplexityApiEndpoint = 'https://api.perplexity.ai/chat/completions';

export const handler: Handler = async (event) => {

    const apiKey = await fetch(`${paramsAndSecretsUrl}?${new URLSearchParams({
        name: '/perplexity/apikey',
        withDecryption: 'true',
    })}`, {
        method: 'GET',
        headers: {
            'X-Aws-Parameters-Secrets-Token': process.env.AWS_SESSION_TOKEN || '',
        },
    })
        .then(response => response.json())
        .then(json => json.Parameter.Value);

    const answer = await fetch(`${perplexityApiEndpoint}`, {
        method: 'GET',
        headers: {
            'accept': 'application/json',
            'content-type': 'application/json',
            'Authorization:': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'sonar-pro',
            messages: [],
        })
    });

    return { apiKey, };
}