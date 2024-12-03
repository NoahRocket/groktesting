exports.handler = async (event) => {
    const API_KEY = process.env.XAI_API_KEY; // Securely access your API key
    const { userInput } = JSON.parse(event.body);

    try {
        const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                messages: [{ role: 'user', content: userInput }],
                model: 'grok-2',
                stream: false,
                temperature: 0
            })
        });

        const data = await response.json();

        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch data from xAI API' })
        };
    }
};
