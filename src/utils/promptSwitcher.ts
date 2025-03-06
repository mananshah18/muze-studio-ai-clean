/**
 * Prompt Switcher Utility
 * 
 * This file provides functions to easily switch between different prompt variations
 * for quick experimentation without needing to restart the server.
 */

import { EXPERIMENTAL_PROMPTS } from './promptConfig';

// Define the type for prompt keys
type PromptKey = keyof typeof EXPERIMENTAL_PROMPTS;

// Store the current prompt key
let currentPromptKey: PromptKey = 'default';

/**
 * Get the current prompt key
 * @returns The current prompt key
 */
export const getCurrentPromptKey = (): PromptKey => {
  return currentPromptKey;
};

/**
 * Set the current prompt key
 * @param key The prompt key to set
 * @returns True if the key exists and was set, false otherwise
 */
export const setCurrentPromptKey = (key: string): boolean => {
  if (key in EXPERIMENTAL_PROMPTS) {
    currentPromptKey = key as PromptKey;
    console.log(`Prompt switched to: ${key}`);
    return true;
  }
  console.error(`Prompt key "${key}" not found. Available keys: ${Object.keys(EXPERIMENTAL_PROMPTS).join(', ')}`);
  return false;
};

/**
 * Get all available prompt keys
 * @returns Array of available prompt keys
 */
export const getAvailablePromptKeys = (): PromptKey[] => {
  return Object.keys(EXPERIMENTAL_PROMPTS) as PromptKey[];
}; 