import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';


import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class AiService {
    private openai: OpenAI;
    private gemini: GoogleGenAI;
    private readonly logger = new Logger(AiService.name);

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('OPENAI_API_KEY');
        const geminiApiKey = this.configService.get<string>('GEMINI_API_KEY');

        this.logger.log(`DEBUG: Gemini Key Present: ${!!geminiApiKey}`);

        if (apiKey) {
            this.openai = new OpenAI({ apiKey });
        } else {
            this.logger.warn('OPENAI_API_KEY not found. AI features will respond with mock data or errors.');
        }

        if (geminiApiKey) {
            try {
                // Initialize the new GoogleGenAI client (v1beta SDK)
                this.gemini = new GoogleGenAI({ apiKey: geminiApiKey });
                this.logger.log('Gemini API (New SDK) initialized.');
                this.logger.log(`DEBUG: Gemini API Key used: ${geminiApiKey.substring(0, 10)}...`);
            } catch (e) {
                this.logger.error('Failed to initialize Gemini:', e);
            }
        } else {
            this.logger.warn('GEMINI_API_KEY not found.');
        }

        // Initialize Cloudinary
        cloudinary.config({
            cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
            api_key: this.configService.get('CLOUDINARY_API_KEY'),
            api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
        });
    }

    async generateTryOn(
        data: {
            height?: string;
            weight?: string;
            bust?: string;
            waist?: string;
            hips?: string;
            skinTone?: string;
            productName: string;
            productImage?: string;
            productDescription?: string;
        },
        files?: Express.Multer.File[]
    ) {
        // Check if we have uploaded images
        let dressImageUrl = data.productImage;
        let userImageUrl: string | null = null;

        if (files && files.length > 0) {
            this.logger.log(`Processing ${files.length} uploaded images...`);

            // Upload dress image to Cloudinary if it's a file
            const dressFile = files.find(f => f.fieldname === 'dressImage');
            if (dressFile) {
                const dressUpload = await new Promise<any>((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { folder: 'vton-uploads/dresses' },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    const stream = new Readable();
                    stream.push(dressFile.buffer);
                    stream.push(null);
                    stream.pipe(uploadStream);
                });
                dressImageUrl = dressUpload.secure_url;
                this.logger.log(`Dress image uploaded: ${dressImageUrl}`);
            }

            // Upload user image to Cloudinary
            const userFile = files.find(f => f.fieldname === 'userImage');
            if (userFile) {
                const userUpload = await new Promise<any>((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { folder: 'vton-uploads/users' },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    const stream = new Readable();
                    stream.push(userFile.buffer);
                    stream.push(null);
                    stream.pipe(uploadStream);
                });
                userImageUrl = userUpload.secure_url;
                this.logger.log(`User image uploaded: ${userImageUrl}`);
            }
        }

        // If we have both images, use VTON directly
        if (dressImageUrl && userImageUrl) {
            return this.performVTON(dressImageUrl, userImageUrl, data);
        }

        // Otherwise, use measurement-based generation (original flow)
        return this.performMeasurementBasedVTON(data, dressImageUrl);
    }

    private async performVTON(dressImageUrl: string, userImageUrl: string, data: any) {
        // Replicate has been removed - falling back to measurement-based generation
        this.logger.log('Using measurement-based VTON fallback...');
        return this.performMeasurementBasedVTON(data, dressImageUrl);
    }

    private async performMeasurementBasedVTON(data: any, dressImageUrl?: string) {
        // 1. Primary: Nano Banana (Gemini 2.5 Flash Image)
        if (this.gemini) {
            try {
                this.logger.log('Starting Nano Banana (Gemini 2.5 Flash Image) generation...');

                const prompt = `
                    Generate a hyper-realistic full-body fashion photo of a female model wearing: ${data.productDescription || data.productName}.
                    Model details: Height ${data.height}cm, Weight ${data.weight}kg, Body ${data.bust}-${data.waist}-${data.hips}, Skin ${data.skinTone || 'neutral'}.
                    Setting: Professional studio, elegant pose, 8k resolution, photorealistic quality.
                    The image should look like a high-end fashion magazine cover.
                `;

                const response = await this.gemini.models.generateContent({
                    model: 'gemini-2.5-flash-image',
                    contents: prompt,
                    config: {
                        responseModalities: ['IMAGE'],
                        safetySettings: [
                            {
                                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
                            },
                            {
                                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                                threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
                            },
                            {
                                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                                threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
                            },
                            {
                                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                                threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
                            }
                        ]
                    }
                });

                // Extract image data from response
                if (response.candidates && response.candidates[0]?.content?.parts?.[0]?.inlineData) {
                    const base64Image = response.candidates[0].content.parts[0].inlineData.data as string;
                    this.logger.log('Nano Banana image generated successfully. Uploading to Cloudinary...');

                    // Upload to Cloudinary
                    const uploadResult = await new Promise<any>((resolve, reject) => {
                        const uploadStream = cloudinary.uploader.upload_stream(
                            { folder: 'vton-generations' },
                            (error, result) => {
                                if (error) reject(error);
                                else resolve(result);
                            }
                        );
                        const buffer = Buffer.from(base64Image, 'base64');
                        const stream = new Readable();
                        stream.push(buffer);
                        stream.push(null);
                        stream.pipe(uploadStream);
                    });

                    this.logger.log(`Cloudinary Upload Complete: ${uploadResult.secure_url}`);
                    return {
                        imageUrl: uploadResult.secure_url,
                        mock: false,
                        provider: 'nano-banana-gemini-2.5-flash'
                    };
                } else {
                    this.logger.warn('Nano Banana returned no image data.');
                }

            } catch (error) {
                this.logger.error('Nano Banana generation failed:', error);
            }
        }

        // 2. Fallback: OpenAI DALL-E 3
        if (this.openai) {
            try {
                this.logger.log('Falling back to OpenAI DALL-E 3...');
                const prompt = this.constructPrompt(data);

                const response = await this.openai.images.generate({
                    model: "dall-e-3",
                    prompt: prompt,
                    n: 1,
                    size: "1024x1024",
                    quality: "standard",
                    style: "vivid"
                });

                return {
                    imageUrl: response.data?.[0]?.url,
                    revisedPrompt: response?.data?.[0]?.revised_prompt,
                    provider: 'openai-dalle3'
                };

            } catch (error) {
                this.logger.error('OpenAI Generation failed:', error);
            }
        }

        // 4. Last Resort: Mock Mode
        return this.getMockImage();
    }

    private async getMockImage() {
        this.logger.log('All AI providers failed or missing. Using Mock/Demo Mode.');

        // curated list of high-quality fashion images for demo purposes
        const demoImages = [
            'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80', // Dress
            'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&q=80', // Velvet dress
            'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80', // Red dress
            'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80', // Long dress
            'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80'  // White dress
        ];

        // Select a random image from the list
        const randomImage = demoImages[Math.floor(Math.random() * demoImages.length)];

        // Simulate processing delay for realistic feel
        await new Promise(resolve => setTimeout(resolve, 2000));

        return {
            imageUrl: randomImage,
            mock: true,
            provider: 'mock'
        };
    }

    private constructPrompt(data: any): string {
        return `A hyper-realistic full-body high-fashion photograph of a female model wearing the following dress: '${data.productName}'. 
        The dress is described as: ${data.productDescription || 'elegant and stylish'}.
        
        The model has a body type matching these measurements:
        - Height: ${data.height} cm
        - Weight: ${data.weight} kg
        - Bust: ${data.bust} cm
        - Waist: ${data.waist} cm
        - Hips: ${data.hips} cm
        ${data.skinTone ? `- Skin Tone: ${data.skinTone}` : ''}
            Ensure the dress fits the model's specified body proportions accurately.
        The image should look like a professional e-commerce fashion shot.`;
    }

    async analyzeAnalytics(data: {
        salesHistory: any[];
        categoryDistribution: any[];
        topVendors: any[];
    }) {
        if (!this.gemini) {
            return {
                insights: [
                    "تظهر البيانات نمواً مستقراً في المبيعات الشهرية.",
                    "فئة الفساتين الطويلة هي الأكثر طلباً حالياً.",
                    "هناك فرصة كبيرة لزيادة المبيعات من خلال التركيز على عروض نهاية الأسبوع."
                ],
                summary: "بناءً على البيانات المتاحة، المنصة تعمل بشكل جيد مع إمكانيات نمو عالية في قطاع الأزياء النسائية.",
                provider: 'mock'
            };
        }

        try {
            const prompt = `
                بصفتك محلل أعمال ذكي لمنصة فستان (Fustan) للتجارة الإلكترونية المتخصصة في الفساتين، قم بتحليل البيانات التالية وتقديم رؤى استراتيجية.
                البيانات:
                - تاريخ المبيعات (6 أشهر): ${JSON.stringify(data.salesHistory)}
                - توزيع الفئات: ${JSON.stringify(data.categoryDistribution)}
                - أفضل البائعين: ${JSON.stringify(data.topVendors)}

                المطلوب:
                1. ملخص تنفيذي قصير للوضع الحالي للمنصة.
                2. 3-5 توصيات استراتيجية محددة لزيادة المبيعات وتحسين الأداء.
                3. توقع بسيط للاتجاهات القادمة بناءً على البيانات.

                يجب أن تكون الإجابة باللغة العربية، بلهجة احترافية ومشجعة، وبتنسيق JSON كالتالي:
                {
                  "summary": "ملخص عام",
                  "insights": ["توصية 1", "توصية 2", ...],
                  "trendPrediction": "توقع الاتجاه"
                }
            `;

            const result = await (this.gemini as any).models.generateContent({
                model: 'gemini-1.5-flash',
                contents: [{ role: 'user', parts: [{ text: prompt }] }]
            });

            const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';

            // Clean up JSON if Gemini wraps it in markdown blocks
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(jsonStr);

            return {
                ...parsed,
                provider: 'gemini-1.5-flash'
            };
        } catch (error) {
            this.logger.error('Failed to analyze analytics with AI:', error);
            return {
                summary: "حدث خطأ أثناء تحليل البيانات ذكياً. يرجى مراجعة الإحصائيات اليدوية.",
                insights: ["تحقق من استقرار اتصال الإنترنت والوصول إلى API."],
                provider: 'error-fallback'
            };
        }
    }
}