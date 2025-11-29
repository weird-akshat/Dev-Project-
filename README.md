# Dev-Project-
This is a small application built to generate templates for whatsapp campaigns.

It has a single endpoint generate-campaign which has a request body: 


Example 
Request
{
  "question": "I want to create a campaign for Christmas for blue tea. with Buy 2 get 3 offer on shopping above RS 1299",
  "context": {
    "brand": "https://bluetea.com",
    "products": "x, y, z"
  }
} 

Response
{
    "image": {
        "headline": "Blue Tea Christmas Offer",
        "imagePrompt": "A beautifully composed flat lay image showcasing Blue Tea products x, y, and z in elegant, festive Christmas packaging. The scene should evoke a cozy and luxurious Christmas atmosphere, with soft twinkling fairy lights, subtle gold and silver Christmas ornaments, and a warm, inviting glow. A steaming cup of vibrant blue tea is visible, suggesting comfort and warmth. The overall aesthetic should be sophisticated and clearly communicate the 'Buy 2 Get 3 Free' offer through an abundant and visually appealing product display, emphasizing generosity and celebration. High resolution, warm lighting, holiday cheer, premium feel.",
        "imageUrl": "/images/imagen-1764445900438.png"
    },
    "template": {
        "templateName": "christmas_blue_tea_buy2get3",
        "language": "en",
        "variables": [
            "customer_name",
            "product_x",
            "product_y",
            "product_z",
            "minimum_spend"
        ],
        "body": "Hello {{customer_name}}! This Christmas, experience the magic of Blue Tea! We're spreading holiday cheer with an exclusive offer: Buy 2 of our exquisite products and Get 3 FREE! Indulge in our special selection including {{product_x}}, {{product_y}}, and {{product_z}}. This amazing deal is valid on purchases above RS {{minimum_spend}}. Perfect for gifting or treating yourself! Shop now and make your festive season extra special.",
        "buttonCtas": [
            {
                "type": "URL",
                "label": "Shop Christmas Deals",
                "payload": "https://www.bluetea.com/christmas-offer"
            },
            {
                "type": "QUICK_REPLY",
                "label": "Tell Me More",
                "payload": "CHRISTMAS_OFFER_DETAILS"
            }
        ]
    }
}






The main idea behind the application is to transform the input using llms.

The request is recieved, and then sent to an LLM (gemini in this case).
The LLM analyzes the website and the input to generate the template along with an image prompt. (see llmservice.ts for implementation).
The intermediate response is of the format:

  imagePrompt: {
        headline: string;
        prompt: string;
    };
    template: {
        templateName: string;
        language: string;
        variables: string[];
        body: string;
        buttonCtas: {
            type: "URL" | string; // can extend if more CTA types exist
            label: string;
            payload: string;
        }[];
    };
The image prompt is then used as an input to create an image with an image generation tool (pollincation in this case).
This image is then stored on the server and the link to the image is then attached in the response that is returned.


Configuration & Environment

Node & packages: The project uses TypeScript and expects dependencies defined in package.json (install with npm install).
Environment variables:
GOOGLE_API_KEY: required for the GoogleGenAI client used in llmService.ts.


Setup & Run
	
Install dependencies:
	node install
Run in development (project likely exposes an npm script such as dev):
	npm run dev
