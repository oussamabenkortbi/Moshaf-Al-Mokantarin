import levenshtein from 'js-levenshtein';
import { normalizeText } from './normalizeText';

export const isVerificationMatch = (expected: string, actual: string) => {
  const normalizedExpected = normalizeText(expected);
  const normalizedActual = normalizeText(actual);

  const maxLength = Math.max(normalizedExpected.length, normalizedActual.length);
  const distance = levenshtein(normalizedExpected, normalizedActual);
  const similarity = (1 - distance / maxLength) * 100;

  return similarity >= 90;
};
