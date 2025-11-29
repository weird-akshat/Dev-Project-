import { Request, Response } from "express";
import { GeneratedTemplate, MessageRequest, MessageResponse } from "../types/message";
import { generateCampaign, generateImage } from "../services/llmService";

export const generateTemplate = async (
    req: Request<{}, {}, MessageRequest>,
    res: Response<GeneratedTemplate>
) => {
    const { question, context } = req.body;

    const reply = `Received from ${question}: ${context.brand}`;

    const result = await generateCampaign(question, context);

    let imageUrl = await generateImage(result.imageprompt.headline, result.imageprompt.prompt);

    const response: GeneratedTemplate = {
        image: {
            headline: result.imageprompt.headline,

            imagePrompt: result.imageprompt.prompt,
            imageUrl: imageUrl,
        },
        template: result.template
    }
    return res.status(200).json(response);
};
