"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIProvider = void 0;
class OpenAIProvider {
    constructor(apiKey) {
        this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
        if (!this.apiKey) {
            throw new Error('OPENAI_API_KEY is not set for OpenAIProvider');
        }
    }
    async generate(request) {
        const body = {
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: request.context ? `${request.context}\n\n${request.prompt}` : request.prompt },
            ],
            temperature: request.temperature ?? 0.7,
            max_tokens: request.maxTokens ?? 256,
        };
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`OpenAIProvider request failed: ${res.status} ${res.statusText}: ${text}`);
        }
        const data = await res.json();
        const text = String(data?.choices?.[0]?.message?.content ?? '').trim();
        return {
            text,
            raw: data,
        };
    }
}
exports.OpenAIProvider = OpenAIProvider;
//# sourceMappingURL=openai.provider.js.map