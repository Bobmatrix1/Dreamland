// Helper to check if a string is a single emoji
export const isSingleEmoji = (str: string) => {
  if (!str) return false;
  // This is a simplified check. A more robust one would use a more complex regex.
  const emojiRegex = /^\p{Emoji}$/u;
  // Strip variation selectors
  const strippedStr = str.replace(/[\uFE0F\uFE0E]/g, '');
  return emojiRegex.test(strippedStr);
};
