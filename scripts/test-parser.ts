import { extractJsonPayload } from '../src/lib/json-parser';
import { GenerateQuestionsResponseSchema } from '../src/types/schemas';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error('FAIL:', msg);
    process.exit(1);
  }
}

console.log('Testing json-parser...');

// 1. Raw JSON
const rawJson = JSON.stringify({
  analysis: 'Need more lighting details',
  suggestedDomain: 'Art',
  questions: [
    {
      id: 'q1',
      text: 'What lighting?',
      type: 'single',
      allowOther: true,
      options: [{ id: 'opt1', label: 'Studio' }],
    },
  ],
});

const res1 = extractJsonPayload(rawJson, GenerateQuestionsResponseSchema);
assert(res1.success === true, 'Failed to parse raw JSON');
console.log('Test 1 Passed: Raw JSON');

// 2. Markdown fenced JSON
const markdownJson = `Here is your questions JSON:
\`\`\`json
${rawJson}
\`\`\`
Hope this helps!`;

const res2 = extractJsonPayload(markdownJson, GenerateQuestionsResponseSchema);
assert(res2.success === true, 'Failed to parse Markdown fenced JSON');
console.log('Test 2 Passed: Markdown JSON');

// 3. Invalid Schema
const invalidSchemaJson = JSON.stringify({
  analysis: 'Broken',
  questions: [], // fails .min(1)
});

const res3 = extractJsonPayload(invalidSchemaJson, GenerateQuestionsResponseSchema);
assert(res3.success === false, 'Should fail invalid schema min(1)');
console.log('Test 3 Passed: Schema validation failure caught');

console.log('All json-parser tests passed successfully!');
