// Test to check which Groq models are being detected as "without tools"
console.log('🧪 Testing Groq Model Detection Logic');
console.log('====================================');

// Test the exact same logic as in the chat route
function testModelDetection(selectedChatModel) {
  const isModelWithoutTools = selectedChatModel.includes('cerebras') || 
                             selectedChatModel.includes('llama3.1-8b-cerebras') ||
                             selectedChatModel.includes('llama-3.3-70b-cerebras') ||
                             selectedChatModel.includes('compound-beta') ||
                             selectedChatModel.includes('compound-beta-mini');
  
  return {
    model: selectedChatModel,
    toolsDisabled: isModelWithoutTools,
    reason: isModelWithoutTools ? 'Matches detection pattern' : 'Tools enabled'
  };
}

// Test all Groq models
const groqModels = [
  // Compound models (should have tools disabled)
  'compound-beta',
  'compound-beta-mini',
  
  // Regular Groq models (should have tools enabled)
  'meta-llama/llama-4-scout-17b-16e-instruct',
  'meta-llama/llama-4-maverick-17b-128e-instruct',
  'deepseek-r1-distill-llama-70b',
  'llama-3.3-70b-versatile',
  'qwen-qwq-32b',
  'llama-3.1-8b-instant',
  'gemma2-9b-it',
  'llama3-70b-8192',
  'llama3-8b-8192',
  
  // Cerebras models (should have tools disabled)
  'llama3.1-8b-cerebras',
  'llama-3.3-70b-cerebras',
  'qwen-3-32b-cerebras'
];

console.log('\n🔍 Testing Model Detection:');
console.log('============================');

for (const model of groqModels) {
  const result = testModelDetection(model);
  const status = result.toolsDisabled ? '🚫 Tools DISABLED' : '✅ Tools ENABLED';
  console.log(`${status} | ${model}`);
}

console.log('\n📊 Summary:');
console.log('============');

const toolsDisabled = groqModels.filter(model => testModelDetection(model).toolsDisabled);
const toolsEnabled = groqModels.filter(model => !testModelDetection(model).toolsDisabled);

console.log(`🚫 Models with tools disabled: ${toolsDisabled.length}`);
toolsDisabled.forEach(model => console.log(`   - ${model}`));

console.log(`\n✅ Models with tools enabled: ${toolsEnabled.length}`);
toolsEnabled.forEach(model => console.log(`   - ${model}`));

console.log('\n💡 Analysis:');
console.log('=============');
if (toolsDisabled.length === 5) { // cerebras (3) + compound (2)
  console.log('✅ Detection logic is working correctly');
  console.log('   Only Cerebras and Compound models have tools disabled');
  console.log('   Regular Groq models should have tools enabled');
} else {
  console.log('❌ Detection logic may have issues');
  console.log('   Check the model naming patterns');
}

console.log('\n🚀 If regular Groq models are still giving generic responses:');
console.log('1. The issue might be in the system prompt');
console.log('2. Check if the models are receiving the right configuration');
console.log('3. Test with a simple prompt without tools to isolate the issue');
