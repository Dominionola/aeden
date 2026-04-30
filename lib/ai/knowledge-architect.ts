import Groq from "groq-sdk";
import type { IntelligenceMetadata, IntelligenceVoiceAnalysis, IntelligenceBlock } from "@/types/database";

function getGroqClient() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY environment variable is required");
    return new Groq({ apiKey });
}

export interface IntelligenceModule {
    metadata: IntelligenceMetadata;
    voice_analysis: IntelligenceVoiceAnalysis;
    intelligence_blocks: IntelligenceBlock[];
    contrarian_takes: string[];
    suggested_hashtags_and_keywords: string[];
}

const KNOWLEDGE_ARCHITECT_PROMPT = `You are the Aeden Knowledge Architect. Your goal is to deconstruct long-form content into high-density "Intelligence Modules" for Threads-optimized content generation.

## EXTRACTION PROTOCOL

### 1. HOOK LIBRARY
Identify 5 "Contrarian" or "Scroll-Stopping" hooks buried in the text. These should be:
- Attention-grabbing opening lines
- Counterintuitive claims
- Bold statements that challenge conventional wisdom
- Questions that provoke thought

### 2. ATOMIC THESES
Break the main arguments into 3-5 standalone points. Each thesis should be:
- Self-contained and understandable alone
- Max 280 characters (Threads-friendly)
- Supported by specific data from the source
- Actionable or insightful

### 3. DATA & EVIDENCE
Extract every specific metric, date, name, or percentage. Zero fluff.
- Statistics with context
- Research findings
- Expert quotes
- Timeline events
- Product/company names

### 4. VOICE PROFILE
Analyze the author's tone and writing style:
- Tone markers (e.g., "Aggressive & Scientific", "Chill & Visionary", "Tutorial-Heavy")
- Vocabulary preferences (specific terms used)
- Sentence structure (Short/Punchy vs Academic/Long)

### 5. THREAD FRAMEWORKS
Map the content to proven structures:
- The Mistake/Solution pattern
- The 1-to-100 Roadmap
- The Unpopular Opinion
- The Metrics Transparency approach
- The How-To Tutorial
- The Story Arc narrative

## OUTPUT FORMAT

Respond ONLY with valid JSON matching this schema:
{
  "metadata": {
    "source_title": "string - the article/title",
    "primary_niche": "string - main topic area",
    "complexity_level": "Beginner | Intermediate | Expert"
  },
  "voice_analysis": {
    "tone_markers": ["list of 3 adjectives describing tone"],
    "vocabulary_preferences": ["specific industry terms used"],
    "sentence_structure": "Short/Punchy | Academic/Long"
  },
  "intelligence_blocks": [
    {
      "thesis": "The core point in under 280 chars",
      "supporting_data": ["metrics or facts that support this"],
      "threads_hook_draft": "A potential starting line for a Thread"
    }
  ],
  "contrarian_takes": [
    "points that go against the grain of common belief"
  ],
  "suggested_hashtags_and_keywords": [
    "relevant terms and hashtags for this topic"
  ]
}

CRITICAL: Return ONLY the JSON object, no markdown formatting, no code blocks, no explanation.`;

export async function refactorContent(content: string, sourceTitle: string): Promise<IntelligenceModule> {
    const groq = getGroqClient();

    const prompt = `## SOURCE CONTENT
Title: ${sourceTitle}

${content}`;

    const result = await groq.chat.completions.create({
        messages: [
            { role: "system", content: KNOWLEDGE_ARCHITECT_PROMPT },
            { role: "user", content: prompt }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.2,
        response_format: { type: "json_object" }
    });

    const text = result.choices[0]?.message?.content?.trim() || "{}";

    try {
        const parsed = JSON.parse(text);
        return {
            metadata: {
                source_title: parsed.metadata?.source_title || sourceTitle,
                primary_niche: parsed.metadata?.primary_niche || "General",
                complexity_level: parsed.metadata?.complexity_level || "Intermediate",
            },
            voice_analysis: {
                tone_markers: parsed.voice_analysis?.tone_markers || [],
                vocabulary_preferences: parsed.voice_analysis?.vocabulary_preferences || [],
                sentence_structure: parsed.voice_analysis?.sentence_structure || "Short/Punchy",
            },
            intelligence_blocks: parsed.intelligence_blocks || [],
            contrarian_takes: parsed.contrarian_takes || [],
            suggested_hashtags_and_keywords: parsed.suggested_hashtags_and_keywords || [],
        };
    } catch (error) {
        console.error("Failed to parse Knowledge Architect response:", error);
        return {
            metadata: {
                source_title: sourceTitle,
                primary_niche: "General",
                complexity_level: "Intermediate",
            },
            voice_analysis: {
                tone_markers: [],
                vocabulary_preferences: [],
                sentence_structure: "Short/Punchy",
            },
            intelligence_blocks: [],
            contrarian_takes: [],
            suggested_hashtags_and_keywords: [],
        };
    }
}

export function buildKnowledgeContext(vaultEntries: IntelligenceModule[]): string {
    if (!vaultEntries.length) return "";

    let context = "## Knowledge Context (from your sources)\n\n";

    for (const entry of vaultEntries) {
        context += `### ${entry.metadata.source_title}\n`;
        context += `Niche: ${entry.metadata.primary_niche} | Level: ${entry.metadata.complexity_level}\n\n`;
        
        if (entry.intelligence_blocks.length) {
            context += "Key Insights:\n";
            for (const block of entry.intelligence_blocks.slice(0, 3)) {
                context += `- ${block.thesis}\n`;
                if (block.supporting_data.length) {
                    context += `  Evidence: ${block.supporting_data.join(", ")}\n`;
                }
            }
        }

        if (entry.contrarian_takes.length) {
            context += "\nContrarian Takes:\n";
            for (const take of entry.contrarian_takes.slice(0, 2)) {
                context += `- ${take}\n`;
            }
        }

        context += "\n---\n\n";
    }

    return context;
}
