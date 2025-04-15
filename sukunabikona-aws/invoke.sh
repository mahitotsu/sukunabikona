#!/bin/bash
payload='{
    "parameters": [
        {
            "name" : "prompt",
            "type" : "string",
            "value": "please tell me about AWS new service announcements."
        }
    ]
}'

aws lambda invoke \
    --function-name SukunabikonaHndStack-PerplexityApiEF31EC10-DjfbmbVfeRUr \
    --cli-binary-format raw-in-base64-out \
    --payload "$payload" \
    /dev/stdout