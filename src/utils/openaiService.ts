// OpenAI Service

import OpenAI from 'openai';
import { SYSTEM_PROMPT, EXPERIMENTAL_PROMPTS } from './promptConfig';
import { getCurrentPromptKey } from './promptSwitcher';

// Import OpenAI types manually since we're using it in the browser
interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Get the current prompt from the EXPERIMENTAL_PROMPTS object
// Change this to use different prompt variations
const getCurrentPrompt = () => {
  const promptKey = getCurrentPromptKey();
  return EXPERIMENTAL_PROMPTS[promptKey] || SYSTEM_PROMPT;
};

/**
 * Processes the OpenAI response to extract only the code part
 * @param response The raw response from OpenAI
 * @returns The extracted code
 */
function extractCodeFromResponse(response: string): string {
  // If the response is already just code, return it as is
  if (response.trim().startsWith('const') || response.trim().startsWith('// Get')) {
    return response;
  }
  
  // Try to extract code blocks
  const codeBlockRegex = /```(?:javascript|js)?\s*([\s\S]*?)```/;
  const match = response.match(codeBlockRegex);
  
  if (match && match[1]) {
    return match[1].trim();
  }
  
  // If no code block found, return the original response
  return response;
}

/**
 * Makes a direct fetch request to Azure OpenAI API
 * @param query The natural language query
 * @param apiKey The Azure OpenAI API key
 * @param endpoint The Azure OpenAI endpoint
 * @param deploymentId The Azure OpenAI deployment ID
 * @param apiVersion The Azure OpenAI API version
 * @returns The generated code
 */
async function callAzureOpenAI(
  query: string,
  apiKey: string,
  endpoint: string,
  deploymentId: string,
  apiVersion: string
): Promise<string> {
  const url = `${endpoint}/openai/deployments/${deploymentId}/chat/completions?api-version=${apiVersion}`;
  
  console.log('Making request to:', url);
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: getCurrentPrompt() },
        { role: 'user', content: query }
      ],
      temperature: 0.7,
      max_tokens: 1500
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Azure OpenAI API error:', errorText);
    throw new Error(`Azure OpenAI API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  console.log('Azure OpenAI response:', data);
  
  const generatedCode = data.choices[0]?.message?.content || '';
  return extractCodeFromResponse(generatedCode);
}

/**
 * Generates Muze chart code based on a natural language query using Azure OpenAI
 * @param query The natural language query describing the desired chart
 * @returns The generated Muze chart code
 */
export async function generateChartCode(query: string): Promise<string> {
  try {
    // Debug all environment variables
    console.log('All import.meta.env values:', {
      VITE_OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY ? 'Exists (not showing for security)' : 'Not found',
      VITE_OPENAI_ENDPOINT: import.meta.env.VITE_OPENAI_ENDPOINT,
      VITE_OPENAI_API_TYPE: import.meta.env.VITE_OPENAI_API_TYPE,
      VITE_OPENAI_DEPLOYMENT_ID: import.meta.env.VITE_OPENAI_DEPLOYMENT_ID,
      VITE_OPENAI_API_VERSION: import.meta.env.VITE_OPENAI_API_VERSION,
      MODE: import.meta.env.MODE,
      DEV: import.meta.env.DEV,
      PROD: import.meta.env.PROD,
    });
    
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    const endpoint = import.meta.env.VITE_OPENAI_ENDPOINT;
    const apiType = import.meta.env.VITE_OPENAI_API_TYPE;
    const deploymentId = import.meta.env.VITE_OPENAI_DEPLOYMENT_ID;
    const apiVersion = import.meta.env.VITE_OPENAI_API_VERSION || '2024-08-01-preview';
    
    console.log('API Key exists:', !!apiKey);
    console.log('API Key length:', apiKey ? apiKey.length : 0);
    console.log('API Type:', apiType);
    console.log('Endpoint:', endpoint);
    console.log('Deployment ID:', deploymentId);
    console.log('API Version:', apiVersion);
    
    if (!apiKey || apiKey === 'YOUR_OPENAI_API_KEY') {
      throw new Error('OpenAI API key is not configured. Please set VITE_OPENAI_API_KEY in your .env file.');
    }
    
    if (apiType === 'azure') {
      if (!endpoint) {
        throw new Error('Azure OpenAI endpoint is not configured. Please set VITE_OPENAI_ENDPOINT in your .env file.');
      }
      
      if (!deploymentId) {
        throw new Error('Azure OpenAI deployment ID is not configured. Please set VITE_OPENAI_DEPLOYMENT_ID in your .env file.');
      }
      
      // Use direct fetch for Azure OpenAI
      return await callAzureOpenAI(query, apiKey, endpoint, deploymentId, apiVersion);
    }
    
    // For standard OpenAI API
    const openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true // Only for client-side use
    });
    
    console.log('OpenAI client initialized');
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: getCurrentPrompt() },
        { role: 'user', content: query }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });
    
    console.log('Response received');
    
    const generatedCode = response.choices[0]?.message?.content || '';
    return extractCodeFromResponse(generatedCode);
  } catch (error: any) {
    console.error('Error generating chart code:', error);
    console.error('Error details:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw new Error(`Failed to generate chart code: ${error.message}`);
  }
}
