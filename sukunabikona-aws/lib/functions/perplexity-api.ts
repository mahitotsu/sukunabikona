import { Handler } from "aws-lambda";
import { URLSearchParams } from "url";

const paramsAndSecretsUrl = 'http://localhost:2773/systemsmanager/parameters/get';
const perplexityApiEndpoint = 'https://api.perplexity.ai/chat/completions';

export const handler: Handler = async (event) => {

    const name = event.function;
    var answer;
    switch (name) {
        case 'search':
            answer = await search(event);
            break;
        case 'now':
            answer = { now: new Date().toISOString() };
            break;
        default:
            answer = 'The specified function name is not defined.';
            break;
    };

    return {
        messageVersion: '1.0',
        response: {
            actionGroup: event.actionGroup,
            function: event.function,
            functionResponse: { responseBody: { TEXT: { body: JSON.stringify(answer, null, 4) } } },
        },
        sessionAttributes: event.sessionAttributes,
        promptSessionAttributes: event.promptSessionAttributes,
    };
};

const search = (event: any): Promise<any | undefined> => {

    const parameters = event.parameters as [{ name: string; type: string; value: string; }] || [];
    const prompt = parameters.find(param => param.name)?.value;
    return get_apiKey().then(apiKey => invoke_api(apiKey, prompt));
}

const get_apiKey = (): Promise<any | undefined> => {

    return fetch(`${paramsAndSecretsUrl}?${new URLSearchParams({
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
};

const invoke_api = (apiKey: string | undefined, prompt: string | undefined): Promise<any | undefined> => {

    if (apiKey == undefined || prompt == undefined) {
        return Promise.resolve(undefined);
    }

    return fetch(`${perplexityApiEndpoint}`, {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'content-type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'sonar-pro',
            messages: [{
                role: 'system',
                content: `
                You are an AI assistant that provides up-to-date information based on internet searches.

                1. Create answers that include the information the user is looking for.
                2. If multiple answers are possible, include all possible answers in the answer.
                3. If multiple answers are included, separate them with a blank line.
                4. Answers should not be formatted with Markdown.
                `
            }, {
                role: 'user',
                content: prompt,
            }],
        })
    })
        .then(response => response.json())
        .then(json => json.choices[0].message.content);
};