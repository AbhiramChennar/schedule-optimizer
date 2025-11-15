import axios from 'axios';
import Constants from 'expo-constants';

// Replace with your Groq API key
const GROQ_API_KEY = Constants.expoConfig?.extra?.groqApiKey || 'fallback-key';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Analyzes an assignment description using AI
 * Returns estimated time, difficulty, and parsed details
 */
export const analyzeAssignment = async (title, description, className, difficulty = 'Medium') => {
  try {
    const prompt = `You are an AI assistant helping a high school student manage their workload. Analyze this assignment and provide estimates.

Assignment Title: ${title}
Class: ${className}
Class Difficulty: ${difficulty}
Description: ${description || 'No description provided'}

Provide your analysis in this EXACT JSON format (no other text):
{
  "estimatedTime": <number between 0.5 and 20>,
  "difficulty": "<Easy/Medium/Hard>",
  "keyTasks": ["<task 1>", "<task 2>", "<task 3>"],
  "reasoning": "<brief explanation>"
}

Consider:
- Type of assignment (essay, problem set, reading, project)
- Class difficulty level
- Typical time for high school students
- Be realistic and helpful`;

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama-3.3-70b-versatile', // Fast and free Groq model
        messages: [
          {
            role: 'system',
            content: 'You are a helpful academic planning assistant. Always respond with valid JSON only, no markdown formatting or extra text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        }
      }
    );

    const aiResponse = response.data.choices[0].message.content;
    
    // Parse the JSON response
    // Remove markdown code blocks if present
    const cleanedResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
    const analysis = JSON.parse(cleanedResponse);

    return {
      success: true,
      estimatedTime: analysis.estimatedTime,
      difficulty: analysis.difficulty,
      keyTasks: analysis.keyTasks,
      reasoning: analysis.reasoning
    };

  } catch (error) {
    console.error('Error analyzing assignment:', error.response?.data || error.message);
    
    // Return fallback values if AI fails
    return {
      success: false,
      estimatedTime: 2,
      difficulty: difficulty,
      keyTasks: [],
      reasoning: 'AI analysis unavailable',
      error: error.message
    };
  }
};

/**
 * Generates study schedule suggestions based on assignments
 */
export const generateScheduleSuggestions = async (assignments, availableHours = 4) => {
  try {
    const assignmentSummary = assignments.map(a => 
      `- ${a.title} (${a.className}, due ${a.dueDate}, ${a.estimatedTime}h)`
    ).join('\n');

    const prompt = `You are helping a high school student plan their study time.

Available study time per day: ${availableHours} hours

Current assignments:
${assignmentSummary}

Suggest a prioritized study plan for today. Respond in this EXACT JSON format:
{
  "suggestions": [
    {
      "assignment": "<assignment title>",
      "suggestedTime": "<time in hours>",
      "priority": "<High/Medium/Low>",
      "reason": "<why to prioritize this>"
    }
  ],
  "totalTime": <total hours>,
  "message": "<brief motivational message>"
}`;

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful academic planning assistant. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 600
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        }
      }
    );

    const aiResponse = response.data.choices[0].message.content;
    const cleanedResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
    const schedule = JSON.parse(cleanedResponse);

    return {
      success: true,
      ...schedule
    };

  } catch (error) {
    console.error('Error generating schedule:', error.response?.data || error.message);
    return {
      success: false,
      error: error.message
    };
  }
};