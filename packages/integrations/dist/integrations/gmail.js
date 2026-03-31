"use strict";
// packages/integrations/src/integrations/gmail.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.GmailIntegration = void 0;
const googleapis_1 = require("googleapis");
/**
 * Gmail Integration Provider
 *
 * Provides tools for:
 * - Email reading and sending
 * - Label management
 * - Search functionality
 * - Attachment handling
 */
class GmailIntegration {
    constructor() {
        this.type = 'gmail';
        this.name = 'Gmail';
        this.description = 'Access and manage Gmail messages and labels';
        this.authType = 'oauth2';
        this.requiredScopes = [
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/gmail.send',
            'https://www.googleapis.com/auth/gmail.labels',
        ];
        this.gmail = null;
        this.tools = [
            {
                name: 'search_emails',
                description: 'Search for emails in Gmail',
                parameters: {
                    type: 'object',
                    properties: {
                        query: {
                            type: 'string',
                            description: 'Gmail search query',
                            required: ['query'],
                        },
                        maxResults: {
                            type: 'number',
                            description: 'Maximum number of results',
                            default: 10,
                        },
                    },
                    required: ['query'],
                },
                execute: this.searchEmails.bind(this),
            },
            {
                name: 'send_email',
                description: 'Send an email via Gmail',
                parameters: {
                    type: 'object',
                    properties: {
                        to: {
                            type: 'string',
                            description: 'Recipient email address',
                            required: ['to'],
                        },
                        subject: {
                            type: 'string',
                            description: 'Email subject',
                            required: ['subject'],
                        },
                        body: {
                            type: 'string',
                            description: 'Email body (plain text or HTML)',
                            required: ['body'],
                        },
                        cc: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'CC recipients',
                        },
                        bcc: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'BCC recipients',
                        },
                    },
                    required: ['to', 'subject', 'body'],
                },
                execute: this.sendEmail.bind(this),
            },
            {
                name: 'get_email',
                description: 'Get a specific email by ID',
                parameters: {
                    type: 'object',
                    properties: {
                        messageId: {
                            type: 'string',
                            description: 'Gmail message ID',
                            required: ['messageId'],
                        },
                        format: {
                            type: 'string',
                            enum: ['minimal', 'full', 'raw'],
                            description: 'Format of the returned message',
                            default: 'full',
                        },
                    },
                    required: ['messageId'],
                },
                execute: this.getEmail.bind(this),
            },
        ];
    }
    async initialize(config) {
        const auth = new googleapis_1.google.auth.GoogleAuth({
            credentials: {
                type: 'authorized_user',
                client_id: config.credentials.clientId,
                client_secret: config.credentials.clientSecret,
                refresh_token: config.credentials.refreshToken,
            },
            scopes: this.requiredScopes,
        });
        this.gmail = googleapis_1.google.gmail({ version: 'v1', auth });
    }
    async authenticate(credentials) {
        try {
            if (!this.gmail)
                return false;
            // Test authentication by getting profile
            await this.gmail.users.getProfile({ userId: 'me' });
            return true;
        }
        catch (error) {
            console.error('Gmail authentication failed:', error);
            return false;
        }
    }
    async disconnect() {
        this.gmail = null;
    }
    async searchEmails(params) {
        try {
            if (!this.gmail) {
                return { success: false, error: 'Gmail client not initialized' };
            }
            const response = await this.gmail.users.messages.list({
                userId: 'me',
                q: params.query,
                maxResults: params.maxResults || 10,
            });
            const messages = response.data.messages || [];
            // Get full message details for each message
            const detailedMessages = await Promise.all(messages.map(async (msg) => {
                const details = await this.gmail.users.messages.get({
                    userId: 'me',
                    id: msg.id,
                    format: 'metadata',
                    metadataHeaders: ['Subject', 'From', 'To', 'Date'],
                });
                return details.data;
            }));
            return {
                success: true,
                data: {
                    messages: detailedMessages,
                    totalCount: messages.length,
                },
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                success: false,
                error: `Failed to search emails: ${errorMessage}`,
            };
        }
    }
    async sendEmail(params) {
        try {
            if (!this.gmail) {
                return { success: false, error: 'Gmail client not initialized' };
            }
            // Create email content
            const emailLines = [
                `To: ${params.to}`,
                `Subject: ${params.subject}`,
                params.cc && `Cc: ${params.cc.join(', ')}`,
                params.bcc && `Bcc: ${params.bcc.join(', ')}`,
                '',
                params.body,
            ].filter(Boolean);
            const email = emailLines.join('\r\n');
            const encodedEmail = Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
            const response = await this.gmail.users.messages.send({
                userId: 'me',
                requestBody: {
                    raw: encodedEmail,
                },
            });
            return {
                success: true,
                data: {
                    messageId: response.data.id,
                    threadId: response.data.threadId,
                },
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                success: false,
                error: `Failed to send email: ${errorMessage}`,
            };
        }
    }
    async getEmail(params) {
        try {
            if (!this.gmail) {
                return { success: false, error: 'Gmail client not initialized' };
            }
            const response = await this.gmail.users.messages.get({
                userId: 'me',
                id: params.messageId,
                format: params.format || 'full',
            });
            return {
                success: true,
                data: response.data,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                success: false,
                error: `Failed to get email: ${errorMessage}`,
            };
        }
    }
}
exports.GmailIntegration = GmailIntegration;
//# sourceMappingURL=gmail.js.map