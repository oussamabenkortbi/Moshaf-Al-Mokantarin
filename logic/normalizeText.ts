export const normalizeText = (text: string) => {
  return text
    .normalize('NFD') // Normalize to decomposed form
    .replace(/[\u064B-\u0652]/g, '') // Remove Arabic diacritical marks explicitly
    .replace(/[^\u0621-\u064A\s]/g, '') // Keep only Arabic letters and spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
    .trim(); // Trim leading and trailing spaces
};