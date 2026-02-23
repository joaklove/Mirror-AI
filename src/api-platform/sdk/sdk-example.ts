import { MirrorAISDK } from './mirror-ai-sdk';

// Initialize the SDK
const sdk = new MirrorAISDK({
  apiKey: 'your-api-key-here',
  baseURL: 'http://localhost:3001/api/v1',
  timeout: 10000
});

// Example 1: Get all journal entries
async function getJournalEntries() {
  try {
    const entries = await sdk.getEntries();
    console.log('Journal Entries:', entries);
  } catch (error) {
    console.error('Error getting journal entries:', error);
  }
}

// Example 2: Create a new journal entry
async function createJournalEntry() {
  try {
    const entry = await sdk.createEntry({
      content: 'Today was a productive day. I worked on my AI project and made good progress.',
      dimension: 'productivity',
      tags: ['work', 'ai', 'progress']
    });
    console.log('Created Journal Entry:', entry);
  } catch (error) {
    console.error('Error creating journal entry:', error);
  }
}

// Example 3: Get analysis results
async function getAnalysis() {
  try {
    const analysis = await sdk.getAnalysis();
    console.log('Analysis Results:', analysis);
  } catch (error) {
    console.error('Error getting analysis:', error);
  }
}

// Example 4: Get all tags
async function getTags() {
  try {
    const tags = await sdk.getTags();
    console.log('Tags:', tags);
  } catch (error) {
    console.error('Error getting tags:', error);
  }
}

// Example 5: Update user settings
async function updateSettings() {
  try {
    const settings = await sdk.updateSettings({
      theme: 'dark',
      language: 'en',
      notifications: true
    });
    console.log('Updated Settings:', settings);
  } catch (error) {
    console.error('Error updating settings:', error);
  }
}

// Example 6: Create a new API key
async function createAPIKey() {
  try {
    const apiKey = await sdk.createAPIKey(
      'My New API Key',
      ['read:entries', 'read:analysis'],
      'basic'
    );
    console.log('Created API Key:', apiKey);
  } catch (error) {
    console.error('Error creating API key:', error);
  }
}

// Example 7: Health check
async function healthCheck() {
  try {
    const health = await sdk.healthCheck();
    console.log('Health Check:', health);
  } catch (error) {
    console.error('Error performing health check:', error);
  }
}

// Run all examples
async function runExamples() {
  console.log('Running SDK examples...');
  
  await healthCheck();
  await getJournalEntries();
  await createJournalEntry();
  await getAnalysis();
  await getTags();
  await updateSettings();
  await createAPIKey();
  
  console.log('All examples completed!');
}

// Export examples for use in other files
export {
  runExamples,
  getJournalEntries,
  createJournalEntry,
  getAnalysis,
  getTags,
  updateSettings,
  createAPIKey,
  healthCheck
};

// Run examples if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runExamples();
}
