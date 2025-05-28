import levenshtein from 'js-levenshtein';
import { normalizeText } from './normalizeText';

/**
 * A simple verse matching function that checks if the spoken text contains enough words
 * from the verse to consider it a match.
 * 
 * @param spokenText The text spoken by the user
 * @param verseText The verse text to match against
 * @returns Object with match result and percentage
 */
export function matchVerse(spokenText: string, verseText: string) {
  // Normalize both texts to remove diacritics and standardize
  const normalizedSpoken = normalizeText(spokenText);
  const normalizedVerse = normalizeText(verseText);
  
  // Extract words
  const verseWords = normalizedVerse.split(/\s+/).filter(w => w.length > 0);
  const spokenWords = normalizedSpoken.split(/\s+/).filter(w => w.length > 0);
  
  // No words to match
  if (verseWords.length === 0) {
    return { isMatch: false, percentage: 0, debug: 'No words in verse' };
  }
  
  // Count how many verse words appear in the spoken text
  let matchCount = 0;
  for (const verseWord of verseWords) {
    for (const spokenWord of spokenWords) {
      // Check for exact match or similar word (using Levenshtein distance)
      if (spokenWord === verseWord || calculateSimilarity(spokenWord, verseWord) >= 70) {
        matchCount++;
        break; // Found a match for this verse word, move to next one
      }
    }
  }
  
  // Calculate percentage of words matched
  const matchPercentage = (matchCount / verseWords.length) * 100;
  
  // Determine threshold based on verse length
  let threshold = 75; // Default threshold for most verses
  
  // For very short verses (1-2 words), just need one word match
  if (verseWords.length <= 2) {
    threshold = 50; // Match at least one word in a two-word verse
  } else if (verseWords.length <= 5) {
    threshold = 60; // For shorter verses, require 60%
  } else if (verseWords.length >= 15) {
    threshold = 70; // For very long verses, only require 70%
  }
  
  // Debug message
  const debug = `Matched ${matchCount}/${verseWords.length} words (${matchPercentage.toFixed(0)}%), threshold: ${threshold}%`;
  
  return {
    isMatch: matchPercentage >= threshold,
    percentage: matchPercentage,
    matchCount,
    totalWords: verseWords.length,
    threshold,
    debug
  };
}

/**
 * Calculate similarity between two strings using Levenshtein distance
 */
export function calculateSimilarity(text1: string, text2: string): number {
  if (!text1 || !text2) return 0;
  
  const maxLength = Math.max(text1.length, text2.length);
  if (maxLength === 0) return 100; // Both empty strings are identical
  
  const distance = levenshtein(text1, text2);
  return (1 - distance / maxLength) * 100;
}
