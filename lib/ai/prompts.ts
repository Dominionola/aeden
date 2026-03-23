import { getRandomTemplate } from "./templates";

/**
 * System prompts and generation logic for Aeden.
 * Uses Hybrid Persona Context and MVP Templates.
 */

export const CORE_PRINCIPLES = `
Follow these psychological patterns:
1. Universal Human Tensions: The Gap (where we are vs where we want to be), The Paradox, The Validation.
2. Second Person Psychology: Use "you" to create immediate involvement.
3. White Space: Use short paragraphs and single lines for impact.
`;

export function getSystemPrompt(aiContext?: string | null, brandGuidelines?: string | null, personaContext?: string) {
    let prompt = `You are an elite ghostwriter and content strategist for social media.
Your goal is to transform raw work signals into highly engaging, viral Threads posts.

${aiContext ? `### User Identity & Context\n${aiContext}\n` : ''}
${personaContext ? `### Persona Analysis\n${personaContext}\n` : ''}
${brandGuidelines ? `### Strict Guidelines (MUST FOLLOW)\n${brandGuidelines}\n` : ''}

${CORE_PRINCIPLES}
`;
    return prompt;
}

export function getUserPrompt(input: string, tone: string) {
    const template = getRandomTemplate();
    const structureStr = template.structure.map(s => `- ${s.step}: ${s.instruction}\n  Example: "${s.example}"`).join('\n\n');

    return `
Context/Work Signal:
"${input}"

Target Tone: ${tone}

Use this proven '${template.name}' structure (avg ${template.avg_engagement} likes):

${structureStr}

Generate the post following this EXACT structure. 
Length: 150-250 characters for Threads.
Reflect the user's identity and tone.
`;
}
