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
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'content-type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'sonar',
            messages: [{
                role: 'system',
                content: `
                You are an AI assistant.

                1. Create answers that include the information the user is looking for.
                2. If multiple answers are possible, include all possible answers in the answer.
                3. If multiple answers are included, separate them with a blank line.
                4. Answers should not be formatted with Markdown.
                `
            }, {
                role: 'user',
                content: 'How many stars are in the universe?'
            }],
        })
    })
        .then(response => response.json())
        .then(json => json);

    return {
        statusCode: 200,
        Headers: {
            'content-type': 'application/json',
        },
        body: answer,
    };
}