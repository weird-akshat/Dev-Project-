import { Request, Response } from "express";
import { MessageRequest, MessageResponse } from "../types/message";
import { generateCampaign } from "../services/llmService";

export const generateTemplate = async (
    req: Request<{}, {}, MessageRequest>,
    res: Response<MessageResponse>
) => {
    const { question, context } = req.body;

    const reply = `Received from ${question}: ${context.brand}`;

    const result = await generateCampaign(question, context);





    res.json({ success: true, reply });
};
