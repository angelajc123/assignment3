/**
 * ProgressionBuilder Concept - AI Augmented Version
 */

import { GeminiLLM } from './gemini-llm';

const NUM_SUGGESTIONS = 12;
const CHORD_PATTERN =
  /^([A-G][#b]?)(?:maj7?|M7?|min7?|m7?|dim7?|aug7?)?(\d+)?((?:sus\d+|add\d+|b\d+|#\d+)*)?(\/[A-G][#b]?)?$/;

export type Chord = string | null;

export interface Progression {
    key: string;
    chords: Chord[];
}

export class ProgressionBuilder {
    private progression: Progression;

    constructor(key: string = "C major") {
        this.progression = {
            key: key,
            chords: []
        };
    }

    setKey(key: string): void {
        this.progression.key = key;
    }

    addSlot(position?: number): void {
        if (position === undefined) {
            this.progression.chords.push(null);
        } else {
            this.validatePosition(position);
            this.progression.chords.splice(position, 0, null);
        }
    }

    addChord(position: number, chord: string): void {
        this.validatePosition(position);
        this.progression.chords[position] = chord;
    }

    removeSlot(position: number): void {
        this.validatePosition(position);
        this.progression.chords.splice(position, 1);
    }

    removeChord(position: number): void {
        this.validatePosition(position);
        this.progression.chords[position] = null;
    }

    /**
     * Suggests harmonious chords for a given position in the progression
     * @param position - The index position in the chord array
     * @returns A list of suggested chords that fit well in the given position
     * @throws Error if position is not a valid index
     */
    async suggestChords(llm: GeminiLLM, position: number): Promise<Chord[]> {
        this.validatePosition(position);

        try {
            const prompt = this.createSuggestionPrompt(this.progression, position);
            const text = await llm.executeLLM(prompt);

            console.log('✅ Received response from Gemini AI!');
            console.log('\n🤖 RAW GEMINI RESPONSE');
            console.log('======================');
            console.log(text);
            console.log('======================\n');

            return this.parseChordSuggestions(text);
        } catch (error) {
            console.error('❌ Error calling Gemini API:', (error as Error).message);
            throw error;
        }
    }

    printProgression(): void {
        console.log('Key:', this.progression.key);
        console.log('Chords:', this.progression.chords);
    }

    private validatePosition(position: number): void {
        if (position < 0 || position >= this.progression.chords.length) {
            throw new Error(`Invalid position: ${position}. Must be between 0 and ${this.progression.chords.length - 1}`);
        }
    }

    private createSuggestionPrompt(progression: Progression, position: number): string {
        return `
You are an expert harmony assistant specializing in Western tonal music (pop, rock, folk, and classical).
Your task is to suggest chords that fit harmonically within a given chord progression and key. Focus on common, simple chords rather than complex or extended jazz chords.

INPUT INFORMATION:
Key: ${progression.key}
Progression: ${progression.chords}
Position: ${position}

The chord progression is written using standard music notation (e.g., "C", "Am", "F", "G", or null if a slot is empty).
Positions in the chord progression are zero-indexed. Position 0 is the first chord, position 1 is the second chord, etc.
The key defines the tonal center for the harmonic context.  
There may be multiple empty slots (null values) in the progression.  
The chord at the specified Position may or may not already be filled — provide suggestions anyway, ignoring the current chord at that position.

YOUR TASK:
Return ${NUM_SUGGESTIONS} musically coherent chord suggestions, ordered from most to least preferred for that position in this progression and key.

GUIDELINES:
- Output must be a JSON object.
- Use standard chord notation: "Cmaj7", "Am7b5", "E7", "F#dim", "G9", etc.
- Each chord should make sense in the context of the given key and surrounding chords.
- You may include both diatonic chords (from the key) and non-diatonic chords (e.g. secondary dominants, borrowed chords, tritone substitutions).
- The ordering should reflect musical likelihood or smoothness of progression (voice leading and harmonic function).
- Avoid duplicates and overly complex symbols (e.g. "C13#11b9").
- Assume 12 semitone equal temperament and common Western harmony.

OUTPUT FORMAT:
{
    "chordSuggestions": ["list of ${NUM_SUGGESTIONS} chords in standard music notation"]
}
Output only valid JSON, no extra text, no markdown, no trailing commas.
`;
    }

    private parseChordSuggestions(text: string): string[] {
        // Validate JSON response format
        const match = text.match(/\{\s*"chordSuggestions"\s*:\s*\[[\s\S]*?\]\s*\}/);
        if (!match) {
            throw new Error('Invalid JSON response format');
        }
        const chordSuggestions = JSON.parse(match[0]).chordSuggestions;

        // Validate number of chord suggestions
        if (chordSuggestions.length !== NUM_SUGGESTIONS) {
            throw new Error(`Invalid number of chord suggestions: ${chordSuggestions.length}`);
        }

        // Validate chords are in standard music notation
        for (const chord of chordSuggestions) {
            if (!chord.match(CHORD_PATTERN)) {
                throw new Error(`Invalid chord suggestion: ${chord}`);
            }
        }

        return chordSuggestions;
    }
}