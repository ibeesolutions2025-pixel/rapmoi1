
import { GoogleGenAI, Type } from "@google/genai";
import { RapBlueprint, SceneEntry } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateRapBlueprint(
  imageData: string,
  inputContent: string,
  userRequestedSceneCount: number,
  onProgress?: (message: string) => void
): Promise<RapBlueprint> {
  const textModel = "gemini-3-pro-preview";
  const imageModel = "gemini-2.5-flash-image";

  if (onProgress) onProgress("ĐANG PHÂN TÍCH Ý TƯỞNG & TỐI ƯU HÓA NHỊP ĐIỆU...");
  
  const systemInstruction = `Bạn là một Nhà sản xuất Rap và Đạo diễn điện ảnh huyền thoại. 
Nhiệm vụ: Phân tích ý tưởng của người dùng để xây dựng một Storyboard Rap chuyên nghiệp (9:16).

QUY TẮC TỐI ƯU HÓA:
1. CÂN ĐỐI SỐ CẢNH: Người dùng chọn khoảng ${userRequestedSceneCount} cảnh, nhưng bạn có quyền TỰ QUYẾT ĐỊNH số lượng cảnh (từ 1 đến 15) để đảm bảo câu chuyện được kể trọn vẹn và lời rap không bị vội vã. Nếu ý tưởng dài và sâu sắc, hãy tăng số cảnh. Nếu ý tưởng ngắn gọn, hãy tập trung vào chất lượng ít cảnh.
2. LỜI RAP (MASTERCLASS): Viết lời rap có hồn, sử dụng ẩn dụ, gieo vần chân, vần lưng, flow chuyên nghiệp. Mỗi đoạn lời phải đủ dài để tạo ra sức nặng cảm xúc (khoảng 2-4 câu thơ/rap).
3. VEO 3 PROMPT (CINEMATIC): Mỗi cảnh phải là một prompt cực kỳ chi tiết. Ví dụ: "Cinematic close-up, low key lighting, neon rim light, heavy rain, anamorphic lens flares, 8k resolution...". Prompt phải mô tả góc máy, ánh sáng, và cảm xúc của nhân vật.
4. TỔNG THỂ: Kết quả phải là một tác phẩm nghệ thuật điện ảnh chuyên nghiệp.

Đầu ra là JSON chuẩn.`;

  const textResponse = await ai.models.generateContent({
    model: textModel,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: imageData.split(',')[1],
          },
        },
        { text: `Ý tưởng: ${inputContent}\nSố cảnh mục tiêu: ${userRequestedSceneCount}` },
      ],
    },
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          videoTitle: { type: Type.STRING },
          videoDescription: { type: Type.STRING },
          hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
          beatDescription: { type: Type.STRING },
          totalDuration: { type: Type.STRING },
          script: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                time: { type: Type.STRING },
                lyrics: { type: Type.STRING },
                visualPrompt: { type: Type.STRING },
                setting: { type: Type.STRING },
              },
              required: ["time", "lyrics", "visualPrompt", "setting"],
            },
          },
        },
        required: ["videoTitle", "videoDescription", "hashtags", "beatDescription", "totalDuration", "script"],
      },
    },
  });

  const blueprintText = textResponse.text;
  if (!blueprintText) throw new Error("AI không thể tạo kịch bản.");
  const blueprint = JSON.parse(blueprintText) as RapBlueprint;

  // 2. Tạo hình ảnh cho mỗi cảnh với retry logic đơn giản
  for (let i = 0; i < blueprint.script.length; i++) {
    const scene = blueprint.script[i];
    if (onProgress) onProgress(`ĐANG VẼ CẢNH ${i + 1}/${blueprint.script.length}...`);

    const imagePrompt = `${scene.visualPrompt}. 9:16 Portrait orientation, cinematic music video style, professional color grading, hyper-realistic, 8k, bokeh, anamorphic lens. No text. Subject looks like the person in the reference photo.`;

    try {
      const imageResponse = await ai.models.generateContent({
        model: imageModel,
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: imageData.split(',')[1],
              },
            },
            { text: imagePrompt }
          ],
        },
        config: {
          imageConfig: { aspectRatio: "9:16" }
        }
      });

      for (const part of imageResponse.candidates![0].content.parts) {
        if (part.inlineData) {
          scene.imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    } catch (e) {
      console.error(`Lỗi render cảnh ${i + 1}`, e);
    }
  }

  return blueprint;
}
