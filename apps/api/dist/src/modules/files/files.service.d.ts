import { drizzle } from 'drizzle-orm/postgres-js';
import { EventsGateway } from '../events/events.gateway';
import * as fs from 'fs';
export declare class FilesService {
    private db;
    private eventsGateway;
    constructor(db: ReturnType<typeof drizzle>, eventsGateway: EventsGateway);
    create(file: any, workspaceId: string, userId: string, tags?: string[], autoProcess?: boolean): Promise<{
        url: string;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        originalName: string;
        mimeType: string;
        sizeBytes: number;
        path: string;
        aiProcessed: boolean;
        aiSummary: string;
        tags: string[];
        uploadedBy: string;
    }>;
    findAll(workspaceId?: string, userId?: string, filters?: {
        mimeType?: string;
        aiProcessed?: boolean;
    }): Promise<{
        url: string;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        originalName: string;
        mimeType: string;
        sizeBytes: number;
        path: string;
        aiProcessed: boolean;
        aiSummary: string;
        tags: string[];
        uploadedBy: string;
    }[]>;
    findOne(id: string, userId?: string): Promise<{
        url: string;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        originalName: string;
        mimeType: string;
        sizeBytes: number;
        path: string;
        aiProcessed: boolean;
        aiSummary: string;
        tags: string[];
        uploadedBy: string;
    }>;
    remove(id: string, userId?: string): Promise<{
        url: string;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        originalName: string;
        mimeType: string;
        sizeBytes: number;
        path: string;
        aiProcessed: boolean;
        aiSummary: string;
        tags: string[];
        uploadedBy: string;
    }>;
    processFile(id: string, userId?: string): Promise<{
        message: string;
    }>;
    getFileStream(id: string, userId?: string): Promise<fs.ReadStream>;
}
