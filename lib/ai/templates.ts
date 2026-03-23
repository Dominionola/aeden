export interface PostTemplate {
    id: string;
    name: string;
    description: string;
    structure: {
        step: string;
        instruction: string;
        example: string;
    }[];
    avg_engagement: number;
    success_rate: number;
}

export const CORE_TEMPLATES: PostTemplate[] = [
    {
        id: "story-arc",
        name: "Story Arc (Learning/Failure)",
        description: "Sharing failures, learnings, and personal growth",
        avg_engagement: 95,
        success_rate: 82,
        structure: [
            { step: "Hook", instruction: "State a past struggle or bold mistake directly", example: "\"I used to spend 10 hours a week just fixing deployment bugs.\"" },
            { step: "Context", instruction: "Explain the situation or what happened", example: "\"Here's what happened: We had no CI/CD pipeline and everything was manual.\"" },
            { step: "Turning point", instruction: "Describe the pivotal realization", example: "\"Then I realized: automation isn't a luxury, it's a survival mechanism.\"" },
            { step: "Lesson", instruction: "What specific insight was learned", example: "\"What I learned: A flaky pipeline is worse than no pipeline at all. You need 100% test coverage on critical paths.\"" },
            { step: "Action", instruction: "State the new approach or outcome", example: "\"Now I deploy 5x a day without breaking a sweat.\"" },
        ],
    },
    {
        id: "how-to",
        name: "How-To Guide",
        description: "Teaching, tutorials, and actionable advice",
        avg_engagement: 67,
        success_rate: 75,
        structure: [
            { step: "Hook", instruction: "Promise a specific goal or outcome in a timeframe", example: "\"How to set up a scalable database in 10 minutes:\"" },
            { step: "Steps", instruction: "List 3-5 concise, actionable steps", example: "\"1. Pick Postgres\\n2. Enable Row-Level Security\\n3. Use connection pooling\"" },
            { step: "Bonus", instruction: "Provide a pro-tip or advanced insight", example: "\"Pro tip: Always use UUIDs for primary keys to prevent enumeration attacks.\"" },
            { step: "CTA", instruction: "Call to action engagement hook", example: "\"Save this for your next weekend project.\"" },
        ],
    },
    {
        id: "metrics",
        name: "Metrics Transparency (Build-in-Public)",
        description: "Milestones, revenue, growth metrics updates",
        avg_engagement: 102,
        success_rate: 88,
        structure: [
            { step: "Update", instruction: "State the core metric update directly", example: "\"MRR Update: Hit $10k this month.\"" },
            { step: "Numbers", instruction: "Show baseline vs current vs growth", example: "\"Started: $8k | Now: $10k | Growth: +25%\"" },
            { step: "What worked", instruction: "List 1-2 tactics that succeeded", example: "\"- Cold emailing targeted founders\\n- Shipping the new dashboard feature\"" },
            { step: "What didn't", instruction: "List 1 tactic that failed", example: "\"- Paid Twitter ads (zero conversions)\"" },
            { step: "Next goal", instruction: "State the next milestone", example: "\"Next target: $15k ARR by December.\"" },
        ],
    },
    {
        id: "contrarian",
        name: "Contrarian Take",
        description: "Challenging conventional wisdom (Polarizing - use sparingly)",
        avg_engagement: 89,
        success_rate: 71,
        structure: [
            { step: "Hook", instruction: "State an unpopular opinion boldly", example: "\"Unpopular opinion: Microservices are a trap for early-stage startups.\"" },
            { step: "Backup", instruction: "Provide 1-3 reasons why", example: "\"Here's why: You spend more time managing infrastructure than writing business logic.\"" },
            { step: "Nuance", instruction: "Acknowledge the other side to build credibility", example: "\"Don't get me wrong, if you have 100+ engineers, you need them.\"" },
            { step: "Conclusion", instruction: "Concluding alternative", example: "\"But for most indie hackers: Stick to a majestic monolith until it absolutely breaks.\"" },
        ],
    }
];

/**
 * Helper to get a random template to enforce structure natively.
 */
export function getRandomTemplate(): PostTemplate {
    return CORE_TEMPLATES[Math.floor(Math.random() * CORE_TEMPLATES.length)];
}
