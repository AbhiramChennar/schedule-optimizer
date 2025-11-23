import axios from 'axios';
import Constants from 'expo-constants';

// API keys loaded from environment variables via expo-constants
const GROQ_API_KEY = Constants.expoConfig?.extra?.groqApiKey;
const GOOGLE_VISION_API_KEY = Constants.expoConfig?.extra?.googleVisionApiKey;

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GOOGLE_VISION_URL = 'https://vision.googleapis.com/v1/images:annotate';

/**
 * Analyzes an assignment description using AI with personalized learning
 * Returns estimated time, difficulty, and parsed details
 */
export const analyzeAssignment = async (title, description, className, difficulty = 'Medium', historicalData = null) => {
  try {
    // Build context from historical data
    let learningContext = '';
    if (historicalData && historicalData.byClass) {
      const classData = historicalData.byClass.find(c => c.className === className);
      
      if (classData && classData.count > 0) {
        const trend = classData.avgDifference > 0 
          ? `takes ${Math.abs(classData.avgDifference).toFixed(1)}h LONGER than estimated`
          : `finishes ${Math.abs(classData.avgDifference).toFixed(1)}h FASTER than estimated`;
        
        learningContext = `\n\nIMPORTANT - Historical Learning Data:
This student has completed ${classData.count} ${className} assignments.
Pattern: They typically ${trend}.
Average actual time: ${classData.avgActual.toFixed(1)}h
Previous estimates: ${classData.avgEstimated.toFixed(1)}h

ADJUST YOUR ESTIMATE based on this pattern to be more accurate for THIS student.`;
      }
      
      if (historicalData.overall.totalCount > 3) {
        learningContext += `\n\nOverall accuracy: ${historicalData.overall.accuracyRate}% (${historicalData.overall.accurateCount}/${historicalData.overall.totalCount} within 30 min)`;
      }
    }

    const prompt = `You are an AI assistant helping a high school student manage their workload. Analyze this assignment and provide estimates.

Assignment Title: ${title}
Class: ${className}
Class Difficulty: ${difficulty}
Description: ${description || 'No description provided'}${learningContext}

Provide your analysis in this EXACT JSON format (no other text):
{
  "estimatedTime": <number between 0.5 and 20>,
  "difficulty": "<Easy/Medium/Hard>",
  "keyTasks": ["<task 1>", "<task 2>", "<task 3>"],
  "reasoning": "<brief explanation>",
  "confidence": "<High/Medium/Low based on available data>"
}

Consider:
- Type of assignment (essay, problem set, reading, project)
- Class difficulty level
- Typical time for high school students
- ${learningContext ? 'MOST IMPORTANT: The historical pattern showing this student is consistently faster/slower' : 'No historical data yet - use general estimates'}
- Be realistic and helpful`;

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful academic planning assistant that learns from student patterns. Always respond with valid JSON only, no markdown formatting or extra text. When historical data is provided, ALWAYS adjust estimates based on the student\'s actual completion patterns.'
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
    const cleanedResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
    const analysis = JSON.parse(cleanedResponse);

    return {
      success: true,
      estimatedTime: analysis.estimatedTime,
      difficulty: analysis.difficulty,
      keyTasks: analysis.keyTasks,
      reasoning: analysis.reasoning,
      confidence: analysis.confidence || 'Medium',
      usedHistoricalData: !!learningContext
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
 * Generates a detailed study plan for today based on assignments
 */
export const generateTodayStudyPlan = async (assignments, availableHours = 4) => {
  try {
    if (assignments.length === 0) {
      return {
        success: true,
        hasPlan: false,
        message: "No assignments yet. Add some to get started!"
      };
    }

    const today = new Date();
    const assignmentDetails = assignments.map(a => {
      const dueDate = new Date(a.dueDate);
      const daysUntil = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
      
      return {
        title: a.title,
        class: a.className,
        dueIn: daysUntil,
        estimatedTime: a.estimatedTime,
        description: a.description?.substring(0, 100) || 'No description'
      };
    }).sort((a, b) => a.dueIn - b.dueIn);

    const prompt = `You are an AI study planner for a high school student. Create a realistic, actionable study plan for TODAY.

Today's Date: ${today.toLocaleDateString()}
Available Study Time: ${availableHours} hours
Current Time: ${today.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}

Assignments:
${assignmentDetails.map((a, i) => 
  `${i+1}. ${a.title} (${a.class}) - Due in ${a.dueIn} days - Est: ${a.estimatedTime}h`
).join('\n')}

Create a study plan that:
- Prioritizes assignments due soonest
- Fits within ${availableHours} hours
- Suggests specific time blocks (e.g., "2:00 PM - 3:30 PM")
- Is realistic for a high school student
- Includes short breaks

Respond in this EXACT JSON format:
{
  "totalPlannedTime": <hours as number>,
  "tasks": [
    {
      "assignment": "<assignment title>",
      "timeBlock": "<e.g., 2:00 PM - 3:30 PM>",
      "duration": <hours as number>,
      "priority": "<High/Medium/Low>",
      "tip": "<short study tip>"
    }
  ],
  "motivationalMessage": "<encouraging message>",
  "breakReminder": "<reminder about taking breaks>"
}`;

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful study planning assistant. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800
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
    const plan = JSON.parse(cleanedResponse);

    return {
      success: true,
      hasPlan: true,
      ...plan
    };

  } catch (error) {
    console.error('Error generating study plan:', error.response?.data || error.message);
    return {
      success: false,
      hasPlan: false,
      error: error.message
    };
  }
};

/**
 * Analyze image using Google Cloud Vision API
 */
const analyzeImageWithGoogleVision = async (imageBase64) => {
  try {
    const response = await axios.post(
      `${GOOGLE_VISION_URL}?key=${GOOGLE_VISION_API_KEY}`,
      {
        requests: [
          {
            image: {
              content: imageBase64
            },
            features: [
              { type: 'TEXT_DETECTION', maxResults: 1 },
              { type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 },
              { type: 'LABEL_DETECTION', maxResults: 5 }
            ]
          }
        ]
      }
    );

    const result = response.data.responses[0];
    
    // Extract text (OCR)
    const detectedText = result.fullTextAnnotation?.text || result.textAnnotations?.[0]?.description || '';
    
    // Extract labels (what's in the image)
    const labels = result.labelAnnotations?.map(label => label.description).join(', ') || '';
    
    // Build description
    let description = '';
    if (detectedText) {
      description += `Text found in image:\n${detectedText}\n\n`;
    }
    if (labels) {
      description += `Image contains: ${labels}`;
    }
    
    return description || 'Image uploaded but no text or recognizable content found.';
  } catch (error) {
    console.error('Google Vision error:', error.response?.data || error.message);
    return 'Could not analyze the image. Please describe what you see.';
  }
};

/**
 * Chat with AI study buddy - supports text and images
 */
export const chatWithAI = async (userMessage, imageBase64 = null, conversationHistory = [], context = {}) => {
  try {
    const systemPrompt = `You are a helpful AI study buddy for high school students.

MANDATORY FORMATTING RULES - YOU MUST FOLLOW THESE EXACTLY:
1. For ANY mathematical expression, you MUST use LaTeX syntax
2. Wrap inline math in single $ signs
3. Wrap display equations in double $$ signs

EXAMPLES OF CORRECT FORMATTING:
Wrong: "5/4 equals 1.25"
Correct: "$\\frac{5}{4}$ equals $1.25$"

Wrong: "x^2 + 3x + 2"
Correct: "$x^2 + 3x + 2$"

You MUST use $\\frac{numerator}{denominator}$ for ALL fractions.`;

    const messages = [{ role: 'system', content: systemPrompt }];

    if (conversationHistory.length === 0) {
      messages.push({ role: 'user', content: 'What is 3 divided by 4?' });
      messages.push({ role: 'assistant', content: 'To find $\\frac{3}{4}$, divide $3$ by $4$ to get $0.75$' });
    }

    conversationHistory.forEach(msg => {
      if (msg.role !== 'system') {
        messages.push({ role: msg.role, content: msg.content });
      }
    });

    let finalMessage = userMessage || 'Can you help?';
    if (imageBase64) {
      const imageDescription = await analyzeImageWithGoogleVision(imageBase64);
      finalMessage = `${userMessage || 'Help with this'}\n\n[Image]\n${imageDescription}`;
    }

    messages.push({ role: 'user', content: finalMessage });

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama-3.3-70b-versatile',
        messages: messages,
        temperature: 0.3,
        max_tokens: 1000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Chat error:', error);
    throw error;
  }
};