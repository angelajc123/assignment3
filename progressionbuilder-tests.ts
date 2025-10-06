/**
 * ProgressionBuilder Test Cases
 * 
 * Demonstrates chord suggestion with LLM on various inputs
 */

import { ProgressionBuilder} from './progressionbuilder';
import { GeminiLLM, Config } from './gemini-llm';

/**
 * Load configuration from config.json
 */
function loadConfig(): Config {
    try {
        const config = require('../config.json');
        return config;
    } catch (error) {
        console.error('❌ Error loading config.json. Please ensure it exists with your API key.');
        console.error('Error details:', (error as Error).message);
        process.exit(1);
    }
}


/**
 * Test case 1: Suggest starting chord for an empty progression
 */
export async function testSuggestStartingChord(): Promise<void> {
    console.log('\n🧪 TEST CASE 1: Starting Chord');
    console.log('==================================');
    
    const progressionBuilder = new ProgressionBuilder();
    progressionBuilder.setKey('B major');
    progressionBuilder.addSlot();
    const position = 0;
    console.log('Input progression:');
    progressionBuilder.printProgression();
    console.log('Input position:', position);

    const config = loadConfig();
    const llm = new GeminiLLM(config);
    const suggestions = await progressionBuilder.suggestChords(llm, position);
    console.log('Chord suggestions:', suggestions);
}


/**
 * Test case 2: Suggest next chord in non-empty progression
 */
export async function testSuggestNextChord(): Promise<void> {
    console.log('\n🧪 TEST CASE 2: Next Chord');
    console.log('==================================');
    
    const progressionBuilder = new ProgressionBuilder();
    progressionBuilder.setKey('A minor');
    progressionBuilder.addSlot();
    progressionBuilder.addChord(0, 'Am');
    progressionBuilder.addSlot();
    progressionBuilder.addChord(1, 'Dm');
    progressionBuilder.addSlot();
    const position = 2;
    console.log('Input progression:');
    progressionBuilder.printProgression();
    console.log('Input position:', position);

    const config = loadConfig();
    const llm = new GeminiLLM(config);
    const suggestions = await progressionBuilder.suggestChords(llm, position);
    console.log('Chord suggestions:', suggestions);
}


/**
 * Test case 1: Suggest chord in middle of progression
 */
export async function testSuggestMiddleChord(): Promise<void> {
    console.log('\n🧪 TEST CASE 3: Middle Chord');
    console.log('==================================');

    const progressionBuilder = new ProgressionBuilder();
    progressionBuilder.addSlot();
    progressionBuilder.addChord(0, 'C');
    progressionBuilder.addSlot();
    progressionBuilder.addChord(1, 'G');
    progressionBuilder.addSlot();
    progressionBuilder.addChord(2, 'Am');
    progressionBuilder.addSlot();
    progressionBuilder.addChord(3, 'F');
    const position = 1;

    console.log('Input progression:');
    progressionBuilder.printProgression();
    console.log('Input position:', position);

    const config = loadConfig();
    const llm = new GeminiLLM(config);
    const suggestions = await progressionBuilder.suggestChords(llm, position);
    console.log('Chord suggestions:', suggestions);
}

/**
 * Main function to run all test cases
 */
async function main(): Promise<void> {
    console.log('🎵 ProgressionBuilder Test Suite');
    console.log('========================\n');
    
    try {
        await testSuggestStartingChord();
        await testSuggestNextChord();
        await testSuggestMiddleChord();
        
        console.log('\n🎉 All test cases completed successfully!');
        
    } catch (error) {
        console.error('❌ Test error:', (error as Error).message);
        process.exit(1);
    }
}

// Run the tests if this file is executed directly
if (require.main === module) {
    main();
}
