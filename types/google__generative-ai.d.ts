declare module "@google/generative-ai" {
  export interface GenerationConfig {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
  }

  export interface ModelConfig {
    model: string;
    generationConfig?: GenerationConfig;
  }

  export interface ContentPart {
    text: string;
  }

  export interface Content {
    role: string;
    parts: ContentPart[];
  }

  export interface GenerateContentRequest {
    contents: Content[];
  }

  export interface GenerateContentResult {
    response: Promise<GenerateContentResponse>;
  }

  export interface GenerateContentResponse {
    text(): string;
  }

  export class GenerativeModel {
    constructor(modelConfig: ModelConfig);
    generateContent(request: GenerateContentRequest | string): Promise<GenerateContentResult>;
  }

  export class GoogleGenerativeAI {
    constructor(apiKey: string);
    getGenerativeModel(config: ModelConfig): GenerativeModel;
  }
} 