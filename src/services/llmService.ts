// src/services/llm.service.ts
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import { z } from "zod";
import { Context } from "../types/message";
import * as fs from "fs/promises";
import * as path from 'path';
const PUBLIC_IMAGE_DIR = path.join(process.cwd(), 'public', 'images');

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY || "" });

const ctaSchema = z.object({
    type: z.enum(["URL", "PHONE", "QUICK_REPLY"]).describe("Type of the button"),
    label: z.string().describe("Text on the button"),
    payload: z.string().describe("The URL or payload for the button"),
});

const templateSchema = z.object({
    templateName: z.string().describe("Unique name for the template"),
    language: z.string().describe("Language code (e.g., en)"),
    variables: z.array(z.string()).describe("List of variable keys used in the body text"),
    body: z.string().describe("The main message text with {{variables}}"),
    buttonCtas: z.array(ctaSchema),
});

const imagePromptSchema = z.object({
    headline: z.string().describe("Short headline for the image creative for eg 'Buy 1 Get 1 Free'"),
    prompt: z.string().describe("A detailed prompt to generate an image for this campaign"),
});

const marketingCampaignSchema = z.object({
    imageprompt: imagePromptSchema,
    template: templateSchema,
});

const marketingCampaignJsonSchema = {
    type: "object",
    properties: {
        imageprompt: {
            type: "object",
            properties: {
                headline: {
                    type: "string",
                    description: "Short headline for the image creative"
                },
                prompt: {
                    type: "string",
                    description: "A detailed prompt to generate an image for this campaign"
                }
            },
            required: ["headline", "prompt"]
        },
        template: {
            type: "object",
            properties: {
                templateName: {
                    type: "string",
                    description: "Unique name for the template"
                },
                language: {
                    type: "string",
                    description: "Language code (e.g., en)"
                },
                variables: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of variable keys used in the body text"
                },
                body: {
                    type: "string",
                    description: "The main message text with {{variables}}"
                },
                buttonCtas: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            type: {
                                type: "string",
                                enum: ["URL", "PHONE", "QUICK_REPLY"],
                                description: "Type of the button"
                            },
                            label: {
                                type: "string",
                                description: "Text on the button"
                            },
                            payload: {
                                type: "string",
                                description: "The URL or payload for the button"
                            }
                        },
                        required: ["type", "label", "payload"]
                    }
                }
            },
            required: ["templateName", "language", "variables", "body", "buttonCtas"]
        }
    },
    required: ["imageprompt", "template"]
};

async function generateCampaign(prompt: string, context: Context) {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt + context.brand + " " + context.products,
        config: {
            responseMimeType: "application/json",
            responseSchema: marketingCampaignJsonSchema,
        },
    });

    const responseText = response.text;
    if (!responseText) {
        throw new Error("No response text received from AI model");
    }

    const campaignData = marketingCampaignSchema.parse(JSON.parse(responseText));

    console.log(JSON.stringify(campaignData, null, 2));

    return campaignData;
}
export { generateCampaign };

async function generateImage(headline: string, prompt: string) {

    const encodedPrompt = encodeURIComponent(`${headline}, ${prompt}`);

    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}`;

    console.log(`Fetching image from: ${url}`);

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Image API returned status: ${response.status} ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        let idx = Date.now();
        const filename = `imagen-${idx}.png`;
        const serverFilePath = path.join(PUBLIC_IMAGE_DIR, filename);

        await fs.mkdir(PUBLIC_IMAGE_DIR, { recursive: true });

        await fs.writeFile(serverFilePath, buffer);


        const publicUrlPath = `/images/${filename}`;

        return publicUrlPath;
    } catch (error) {
        console.error("Error generating or saving image:", error);
        throw error;
    }
}
export { generateImage };