exports.handler = async (event) => {
    const API_KEY = process.env.XAI_API_KEY;
    const { userInput, level, topic } = JSON.parse(event.body);

    try {
        const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                messages: [
                    { role: 'system', content: `You are a Swedish tutor for ${level} learners.` },
                    { role: 'user', content: userInput }
                ],
                model: 'grok-beta',
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
