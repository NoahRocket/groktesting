// File: netlify/functions/xaiProxy.js

const fetch = require('node-fetch');

exports.handler = async (event) => {
    // Ensure the request method is POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405, // Method Not Allowed
            headers: { 'Allow': 'POST' },
            body: JSON.stringify({ error: 'Method Not Allowed. Use POST.' }),
        };
    }

    // Parse the request body
    let requestBody;
    try {
        requestBody = JSON.parse(event.body);
    } catch (error) {
        return {
            statusCode: 400, // Bad Request
            body: JSON.stringify({ error: 'Invalid JSON format in request body.' }),
        };
    }

    // Destructure necessary fields from the request body
    const { messages, proficiency, topic } = requestBody;

    // Validate the presence and format of the messages array
    if (!messages || !Array.isArray(messages)) {
        return {
            statusCode: 400, // Bad Request
            body: JSON.stringify({ error: 'Invalid or missing "messages" array in request body.' }),
        };
    }

    // Optional: Validate proficiency and topic if needed
    // (Assuming proficiency and topic are already handled on the frontend)

    // Retrieve the API key from environment variables
    const API_KEY = process.env.XAI_API_KEY;
    if (!API_KEY) {
        return {
            statusCode: 500, // Internal Server Error
            body: JSON.stringify({ error: 'API key is not configured.' }),
        };
    }

    try {
        // Make API call to xAI with the entire messages array
        const aiResponse = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({
                messages: messages, // Pass the full conversation history
                model: 'grok-beta', // Specify the AI model
                stream: false,       // Disable streaming for simplicity
                temperature: 0.1,    // Control the randomness of responses
                max_tokens: 150,     // Limit the AI's response length to control costs
            }),
        });

        // Check if the response from AI API is successful
        if (!aiResponse.ok) {
            const errorText = await aiResponse.text();
            return {
                statusCode: aiResponse.status,
                body: JSON.stringify({ error: `AI API Error: ${errorText}` }),
            };
        }

        // Parse the AI API response
        const aiData = await aiResponse.json();

        // Extract the AI's message content
        const aiMessage = aiData.choices && aiData.choices.length > 0
            ? aiData.choices[0].message.content
            : 'No response from AI.';

        // Mock corrections for testing purposes
        // Replace this with actual correction logic if your AI supports it
        const mockCorrections = [
            { word: 'hejllo', suggestion: 'hej' },
            { word: 'marr', suggestion: 'mår' },
        ];

        // Optional: You can implement actual correction logic here by analyzing the AI's response

        // Prepare the response payload
        const responsePayload = {
            choices: aiData.choices, // Forward the AI's choices
            corrections: mockCorrections, // Attach corrections to the response
            usage: aiData.usage, // Forward usage data if available
        };

        // Return the successful response
        return {
            statusCode: 200,
            body: JSON.stringify(responsePayload),
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500, // Internal Server Error
            body: JSON.stringify({ error: 'Failed to fetch data from xAI API.' }),
        };
    }
};
