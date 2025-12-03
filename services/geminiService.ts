import { GoogleGenAI } from "@google/genai";
import { CharacterProfile } from "../types";

// Using gemini-2.5-flash-image for balanced speed and quality in image generation tasks
const MODEL_NAME = 'gemini-2.5-flash-image';

export const generateSceneImage = async (
  sceneText: string,
  character: CharacterProfile,
  apiKey: string
): Promise<string> => {
  if (!apiKey) {
    throw new Error('API key is missing. Please provide a valid API key.');
  }
  
  const ai = new GoogleGenAI({ apiKey });
  try {
    const parts: any[] = [];

    // If a character reference image exists, add it to the prompt parts for consistency
    if (character.imageBase64 && character.mimeType) {
      parts.push({
        inlineData: {
          data: character.imageBase64,
          mimeType: character.mimeType,
        },
      });
    }

    // Construct a strong prompt for consistency
    const prompt = `
      You are an expert storyboard artist. Generate a cinematic illustration for the following scene description: "${sceneText}".

      ${character.imageBase64 ? 'CRITICAL INSTRUCTION: The main character in this generated image MUST visually match the provided reference image EXACTLY. Maintain the same facial features, hair style, hair color, body type, and clothing style. This is the same person.' : ''}

      Character Details:
      Name: ${character.name}
      Description: ${character.description}

      Art Style Requirements:
      - High quality digital art suitable for a storyboard.
      - Cinematic lighting and composition.
      - Consistent character design (most important).
      - No text overlays or speech bubbles.
      
      Return ONLY the generated image.
    `;

    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: parts,
      },
    });

    // Extract image from response
    // The response might have inlineData if the model returns an image directly
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
        const content = candidates[0].content;
        // Iterate to find the image part
        for (const part of content.parts) {
             if (part.inlineData) {
                const base64Data = part.inlineData.data;
                const mimeType = part.inlineData.mimeType || 'image/png';
                return `data:${mimeType};base64,${base64Data}`;
             }
        }
    }

    throw new Error("이미지 데이터가 응답에 없습니다.");

  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    throw new Error(error.message || "이미지 생성에 실패했습니다.");
  }
};