import { syllable } from "syllable";
import { match } from "ts-pattern";

/**
 * Makes sure all the required Astro slots are passed to a component.
 *
 * @param Astro - The Astro global object (only in .astro files)
 * @param component - The component name doing the check
 * @param slots - The slots that need to be included
 *
 * @throws {Error} if any required slot is missing
 */
export function requireSlots(
  // FIXME: I have no idea what its actual type is
  Astro: any,
  component: string,
  slots: string[] = ["default"],
): void {
  slots.forEach((slot) => {
    if (!Astro.slots.has(slot)) {
      const label = match(slot)
        .with("default", () => "<slot />")
        .otherwise(() => `<slot name="${slot}" />`);
      const message = `${component} requires ${label}.`;

      console.error(message);
      throw new Error(message);
    }
  });
}

/**
 * Estimates how long it might take to read some text based on word count,
 * sentence flow, and word difficulty using the Flesch-Kincaid formula.
 *
 * @param text - The text you want to check
 * @param wordsPerMinute - How fast someone reads (default is 200 WPM)
 *
 * @returns How many minutes it should take, rounded up
 */
export function estimateReadingTime(
  text: string,
  wordsPerMinute = 200,
): number {
  const sentences = text.split(/[.!?]+/).filter(Boolean);
  const words = text.trim().split(/\s+/);
  const syllables = words.reduce(
    (syllableAccumulator, currentWord) =>
      syllableAccumulator + syllable(currentWord),
    0,
  );

  const totalSentenceCount = sentences.length;
  const totalWordCount = words.length;

  const wordsPerSentence = totalWordCount / totalSentenceCount;
  const syllablesPerWord = syllables / totalWordCount;
  const gradeLevel = 0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59;

  const baseReadingTime = totalWordCount / wordsPerMinute;

  const complexity = 1 + (gradeLevel - 8) / 10;
  const adjustedReadingTime = baseReadingTime * complexity;

  return Math.ceil(adjustedReadingTime);
}
