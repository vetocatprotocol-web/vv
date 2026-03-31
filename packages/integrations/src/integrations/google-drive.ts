// packages/integrations/src/integrations/google-drive.ts

import { google, drive_v3 } from 'googleapis';
import {
  IntegrationProvider,
  IntegrationConfig,
  IntegrationResult,
  ToolDefinition
} from '../types';

/**
 * Google Drive Integration Provider
 *
 * Provides tools for:
 * - File listing and search
 * - File download/upload
 * - Folder management
 * - Permission management
 */
export class GoogleDriveIntegration implements IntegrationProvider {
  readonly type = 'google-drive' as const;
  readonly name = 'Google Drive';
  readonly description = 'Access and manage Google Drive files and folders';
  readonly authType = 'oauth2' as const;
  readonly requiredScopes = [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/drive.file',
  ];

  private drive: drive_v3.Drive | null = null;

  readonly tools: ToolDefinition[] = [
    {
      name: 'list_files',
      description: 'List files in a Google Drive folder',
      parameters: {
        type: 'object',
        properties: {
          folderId: {
            type: 'string',
            description: 'ID of the folder to list (optional, defaults to root)',
          },
          query: {
            type: 'string',
            description: 'Search query to filter files',
          },
          pageSize: {
            type: 'number',
            description: 'Maximum number of files to return',
            default: 10,
          },
        },
      },
      execute: this.listFiles.bind(this),
    },
    {
      name: 'download_file',
      description: 'Download a file from Google Drive',
      parameters: {
        type: 'object',
        properties: {
          fileId: {
            type: 'string',
            description: 'ID of the file to download',
            required: ['fileId'],
          },
        },
        required: ['fileId'],
      },
      execute: this.downloadFile.bind(this),
    },
    {
      name: 'search_files',
      description: 'Search for files in Google Drive',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query (supports Google Drive search syntax)',
            required: ['query'],
          },
          pageSize: {
            type: 'number',
            description: 'Maximum number of results',
            default: 20,
          },
        },
        required: ['query'],
      },
      execute: this.searchFiles.bind(this),
    },
  ];

  async initialize(config: IntegrationConfig): Promise<void> {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: 'authorized_user',
        client_id: config.credentials.clientId,
        client_secret: config.credentials.clientSecret,
        refresh_token: config.credentials.refreshToken,
      },
      scopes: this.requiredScopes,
    });

    this.drive = google.drive({ version: 'v3', auth });
  }

  async authenticate(credentials: Record<string, any>): Promise<boolean> {
    try {
      if (!this.drive) return false;

      // Test authentication by listing root files
      await this.drive.files.list({
        pageSize: 1,
        fields: 'files(id, name)',
      });

      return true;
    } catch (error) {
      console.error('Google Drive authentication failed:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    this.drive = null;
  }

  private async listFiles(params: Record<string, any>): Promise<IntegrationResult> {
    try {
      if (!this.drive) {
        return { success: false, error: 'Google Drive not initialized' };
      }

      const query = params.folderId
        ? `'${params.folderId}' in parents and trashed = false`
        : 'trashed = false';

      const response = await this.drive.files.list({
        q: query,
        pageSize: params.pageSize || 10,
        fields: 'files(id, name, mimeType, size, modifiedTime, webViewLink)',
        orderBy: 'modifiedTime desc',
      });

      return {
        success: true,
        data: {
          files: response.data.files || [],
          totalCount: response.data.files?.length || 0,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: `Failed to list files: ${errorMessage}`,
      };
    }
  }

  private async downloadFile(params: Record<string, any>): Promise<IntegrationResult> {
    try {
      if (!this.drive) {
        return { success: false, error: 'Google Drive not initialized' };
      }

      const response = await this.drive.files.get(
        {
          fileId: params.fileId,
          alt: 'media',
        },
        { responseType: 'stream' }
      );

      return {
        success: true,
        data: {
          stream: response.data,
          headers: response.headers,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: `Failed to download file: ${errorMessage}`,
      };
    }
  }

  private async searchFiles(params: Record<string, any>): Promise<IntegrationResult> {
    try {
      if (!this.drive) {
        return { success: false, error: 'Google Drive not initialized' };
      }

      const response = await this.drive.files.list({
        q: params.query,
        pageSize: params.pageSize || 20,
        fields: 'files(id, name, mimeType, size, modifiedTime, webViewLink)',
        orderBy: 'modifiedTime desc',
      });

      return {
        success: true,
        data: {
          files: response.data.files || [],
          totalCount: response.data.files?.length || 0,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: `Failed to search files: ${errorMessage}`,
      };
    }
  }
}