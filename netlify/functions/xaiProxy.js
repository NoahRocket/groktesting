exports.handler = async (event) => {
    const API_KEY = process.env.XAI_API_KEY;
    const { userInput, level, topic } = JSON.parse(event.body);

    // Proficiency and topic adjustments
    let proficiencyPrompt = '';
    switch (level) {
        case 'beginner':
            proficiencyPrompt = 'Use very simple Swedish with short sentences and basic vocabulary.';
            break;
        case 'intermediate':
            proficiencyPrompt = 'Use intermediate Swedish with common phrases, slightly longer sentences, and moderate vocabulary.';
            break;
        case 'advanced':
            proficiencyPrompt = 'Use advanced Swedish with complex sentence structures and rich vocabulary. Provide detailed responses.';
            break;
        default:
            proficiencyPrompt = 'Use simple Swedish.';
    }

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
        // API call to xAI
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
                        content: `You are a Swedish tutor. Adjust your responses to match the following criteria:
                        - Proficiency: ${proficiencyPrompt}
                        - Topic: ${topicPrompt}`
                    },
                    { role: 'user', content: userInput }
                ],
                model: 'grok-beta',
                stream: false,
                temperature: 0.1,
            }),
        });

        const data = await response.json();

        // Optional: Mock corrections for error highlighting
        const mockCorrections = [
            { word: 'hejllo', suggestion: 'hej' },
            { word: 'är', suggestion: 'är' },
        ];

        return {
            statusCode: 200,
            body: JSON.stringify({
                ...data,
                corrections: mockCorrections, // Attach corrections if available
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
