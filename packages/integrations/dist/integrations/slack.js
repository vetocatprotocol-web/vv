"use strict";
// packages/integrations/src/integrations/slack.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlackIntegration = void 0;
const web_api_1 = require("@slack/web-api");
/**
 * Slack Integration Provider
 *
 * Provides tools for:
 * - Message posting and reading
 * - Channel management
 * - User lookup
 * - File sharing
 */
class SlackIntegration {
    constructor() {
        this.type = 'slack';
        this.name = 'Slack';
        this.description = 'Communicate and collaborate via Slack workspaces';
        this.authType = 'api-key';
        this.client = null;
        this.tools = [
            {
                name: 'post_message',
                description: 'Post a message to a Slack channel',
                parameters: {
                    type: 'object',
                    properties: {
                        channel: {
                            type: 'string',
                            description: 'Channel ID or name to post to',
                            required: ['channel'],
                        },
                        text: {
                            type: 'string',
                            description: 'Message text to post',
                            required: ['text'],
                        },
                        thread_ts: {
                            type: 'string',
                            description: 'Thread timestamp to reply in a thread',
                        },
                    },
                    required: ['channel', 'text'],
                },
                execute: this.postMessage.bind(this),
            },
            {
                name: 'get_messages',
                description: 'Retrieve messages from a Slack channel',
                parameters: {
                    type: 'object',
                    properties: {
                        channel: {
                            type: 'string',
                            description: 'Channel ID to get messages from',
                            required: ['channel'],
                        },
                        limit: {
                            type: 'number',
                            description: 'Maximum number of messages to retrieve',
                            default: 10,
                        },
                    },
                    required: ['channel'],
                },
                execute: this.getMessages.bind(this),
            },
            {
                name: 'list_channels',
                description: 'List available Slack channels',
                parameters: {
                    type: 'object',
                    properties: {
                        types: {
                            type: 'string',
                            description: 'Comma-separated list of channel types (public_channel, private_channel, etc.)',
                            default: 'public_channel',
                        },
                    },
                },
                execute: this.listChannels.bind(this),
            },
        ];
    }
    async initialize(config) {
        this.client = new web_api_1.WebClient(config.credentials.token);
    }
    async authenticate(credentials) {
        try {
            if (!this.client)
                return false;
            // Test authentication by getting current user info
            const response = await this.client.auth.test();
            return response.ok === true;
        }
        catch (error) {
            console.error('Slack authentication failed:', error);
            return false;
        }
    }
    async disconnect() {
        this.client = null;
    }
    async postMessage(params) {
        try {
            if (!this.client) {
                return { success: false, error: 'Slack client not initialized' };
            }
            const response = await this.client.chat.postMessage({
                channel: params.channel,
                text: params.text,
                thread_ts: params.thread_ts,
            });
            return {
                success: true,
                data: {
                    messageId: response.ts,
                    channel: params.channel,
                    timestamp: response.ts,
                },
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                success: false,
                error: `Failed to post message: ${errorMessage}`,
            };
        }
    }
    async getMessages(params) {
        try {
            if (!this.client) {
                return { success: false, error: 'Slack client not initialized' };
            }
            const response = await this.client.conversations.history({
                channel: params.channel,
                limit: params.limit || 10,
            });
            return {
                success: true,
                data: {
                    messages: response.messages || [],
                    hasMore: response.has_more,
                },
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                success: false,
                error: `Failed to get messages: ${errorMessage}`,
            };
        }
    }
    async listChannels(params) {
        try {
            if (!this.client) {
                return { success: false, error: 'Slack client not initialized' };
            }
            const response = await this.client.conversations.list({
                types: params.types || 'public_channel',
                limit: 100,
            });
            return {
                success: true,
                data: {
                    channels: response.channels?.map(channel => ({
                        id: channel.id,
                        name: channel.name,
                        isPrivate: channel.is_private,
                        memberCount: channel.num_members,
                    })) || [],
                },
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                success: false,
                error: `Failed to list channels: ${errorMessage}`,
            };
        }
    }
}
exports.SlackIntegration = SlackIntegration;
//# sourceMappingURL=slack.js.map