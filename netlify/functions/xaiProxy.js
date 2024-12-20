exports.handler = async (event) => {
    const API_KEY = process.env.XAI_API_KEY;
    const { userInput, proficiency, topic } = JSON.parse(event.body);

    // Determine proficiency prompt
    let proficiencyPrompt = '';
    switch (proficiency) {
        case 'beginner':
            proficiencyPrompt = 'Use simple Swedish with short sentences and basic vocabulary.';
            break;
        case 'intermediate':
            proficiencyPrompt = 'Use intermediate Swedish with common phrases and slightly longer sentences.';
            break;
        case 'advanced':
            proficiencyPrompt = 'Use advanced Swedish with complex sentence structures and rich vocabulary.';
            break;
        default:
            proficiencyPrompt = 'Use simple Swedish.';
    }

    // Determine topic prompt
    let topicPrompt = '';
    switch (topic) {
        case 'greetings':
            topicPrompt = 'Focus on greetings and small talk, such as introducing yourself or asking how someone is.';
            break;
        case 'ordering-food':
            topicPrompt = 'Focus on phrases and vocabulary related to ordering food at a restaurant or cafe.';
            break;
        case 'travel-phrases':
            topicPrompt = 'Focus on travel phrases, such as asking for directions, transportation, or help.';
            break;
        default:
            topicPrompt = 'Provide general Swedish practice.';
    }

    try {
        // Make API call to xAI
        const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: 'system',
                        content: `You are a Swedish tutor called Gustaf. Adjust your responses based on the following:
                        - Proficiency: ${proficiencyPrompt}
                        - Topic: ${topicPrompt}`
                    },
                    { role: 'user', content: userInput },
                ],
                model: 'grok-2-latest',
                stream: false,
                temperature: 0.1, // Adjust if needed for variability in responses
            }),
        });

        const data = await response.json();

        // Mock corrections for testing purposes (replace with actual corrections if your API supports this)
        const mockCorrections = [
            { word: 'hejllo', suggestion: 'hej' },
            { word: 'marr', suggestion: 'mår' },
        ];

        return {
            statusCode: 200,
            body: JSON.stringify({
                ...data,
                corrections: mockCorrections, // Attach corrections to the response
            }),
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch data from xAI API' }),
        };
    }
};
