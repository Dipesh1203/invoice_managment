import { Part } from "@google/genai";

export function base64ToGenerativePart(
  base64Data: string,
  mimeType: string
): Part {
  return {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };
}
