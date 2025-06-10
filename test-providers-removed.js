// Test script to verify OpenRouter and Glama models have been removed
import { readFileSync } from 'fs';

console.log('🧪 Testing Provider Removal');
console.log('============================');

// Models that should have been removed
const removedModels = [
  // OpenRouter models
  'qwen/qwen2.5-vl-72b-instruct:free',
  'deepseek/deepseek-v3-base:free',
  'meta-llama/llama-4-scout:free',
  'meta-llama/llama-4-maverick:free',
  'nvidia/llama-3.1-nemotron-ultra-253b-v1:free',
  'microsoft/mai-ds-r1:free',
  'tngtech/deepseek-r1t-chimera:free',
  // Glama models
  'phi-3-medium-128k-instruct',
  'phi-3-mini-128k-instruct',
  'llama-3.2-11b-vision-instruct'
];

console.log('\n🔍 Checking Models File...');
const modelsFileContent = readFileSync('./lib/ai/models.ts', 'utf8');
const modelsStillPresent = removedModels.filter(modelId => 
  modelsFileContent.includes(`id: '${modelId}'`)
);

if (modelsStillPresent.length === 0) {
  console.log('✅ All problematic models removed from models.ts');
} else {
  console.log('❌ Some models still present in models.ts:', modelsStillPresent);
}

console.log('\n🔍 Checking Entitlements...');
const entitlementsFileContent = readFileSync('./lib/ai/entitlements.ts', 'utf8');
const entitlementsStillPresent = removedModels.filter(modelId => 
  entitlementsFileContent.includes(`'${modelId}'`)
);

if (entitlementsStillPresent.length === 0) {
  console.log('✅ All problematic models removed from entitlements.ts');
} else {
  console.log('❌ Some models still present in entitlements.ts:', entitlementsStillPresent);
}

console.log('\n🔍 Checking Provider Configuration...');
const providersFileContent = readFileSync('./lib/ai/providers.ts', 'utf8');
const providersStillPresent = removedModels.filter(modelId => 
  providersFileContent.includes(`'${modelId}'`)
);

if (providersStillPresent.length === 0) {
  console.log('✅ All problematic models removed from providers.ts');
} else {
  console.log('❌ Some models still present in providers.ts:', providersStillPresent);
}

console.log('\n🔍 Checking for Provider References...');
const hasOpenRouterImport = providersFileContent.includes("import { createOpenRouter }");
const hasGlamaConfig = providersFileContent.includes("glamaAI");
const hasOpenRouterConfig = providersFileContent.includes("openRouter.chat");

console.log(`OpenRouter import: ${hasOpenRouterImport ? '❌ Still present' : '✅ Removed'}`);
console.log(`Glama config: ${hasGlamaConfig ? '❌ Still present' : '✅ Removed'}`);
console.log(`OpenRouter config: ${hasOpenRouterConfig ? '❌ Still present' : '✅ Removed'}`);

console.log('\n🔍 Checking Working Models...');
const workingModels = [
  'chat-model',
  'gemini-2.0-flash',
  'meta-llama/llama-4-scout-17b-16e-instruct',
  'llama3.1-8b-cerebras',
  'llama-3.3-70b-cerebras'
];

let workingModelsFound = 0;
for (const modelId of workingModels) {
  if (modelsFileContent.includes(`id: '${modelId}'`) || 
      providersFileContent.includes(`'${modelId}'`)) {
    console.log(`✅ Working model ${modelId} still present`);
    workingModelsFound++;
  } else {
    console.log(`❌ Working model ${modelId} missing`);
  }
}

console.log('\n📊 Summary:');
console.log('===========');
console.log(`🗑️ Removed models: ${removedModels.length - modelsStillPresent.length}/${removedModels.length} removed from models.ts`);
console.log(`🗑️ Removed from entitlements: ${removedModels.length - entitlementsStillPresent.length}/${removedModels.length} removed from entitlements.ts`);
console.log(`🗑️ Removed from providers: ${removedModels.length - providersStillPresent.length}/${removedModels.length} removed from providers.ts`);
console.log(`✅ Working models: ${workingModelsFound}/${workingModels.length} still present`);

const allRemoved = modelsStillPresent.length === 0 && 
                   entitlementsStillPresent.length === 0 && 
                   providersStillPresent.length === 0 &&
                   !hasOpenRouterImport &&
                   !hasGlamaConfig &&
                   !hasOpenRouterConfig;

if (allRemoved && workingModelsFound === workingModels.length) {
  console.log('\n🎉 SUCCESS: All problematic providers successfully removed!');
  console.log('   ✅ OpenRouter models removed');
  console.log('   ✅ Glama models removed');
  console.log('   ✅ Provider imports cleaned up');
  console.log('   ✅ Working models preserved');
  console.log('   ✅ Cerebras models still available');
} else {
  console.log('\n⚠️ Some issues detected:');
  if (modelsStillPresent.length > 0) console.log(`   - ${modelsStillPresent.length} models still in models.ts`);
  if (entitlementsStillPresent.length > 0) console.log(`   - ${entitlementsStillPresent.length} models still in entitlements.ts`);
  if (providersStillPresent.length > 0) console.log(`   - ${providersStillPresent.length} models still in providers.ts`);
  if (hasOpenRouterImport) console.log('   - OpenRouter import still present');
  if (hasGlamaConfig) console.log('   - Glama config still present');
  if (hasOpenRouterConfig) console.log('   - OpenRouter config still present');
  if (workingModelsFound < workingModels.length) console.log(`   - ${workingModels.length - workingModelsFound} working models missing`);
}

console.log('\n🚀 Next steps:');
console.log('1. Test your chat interface - it should work better now');
console.log('2. Cerebras models should respond properly');
console.log('3. All other models should continue working normally');
