import { FilesService } from './files.service';
export declare class FilesController {
    private readonly filesService;
    constructor(filesService: FilesService);
    create(file: any, req: any, workspaceId: string, tags?: string, autoProcess?: string): Promise<{
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
    findAll(workspaceId: string, mimeType: string, aiProcessed: string, req: any): Promise<{
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
    findOne(id: string, req: any): Promise<{
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
    remove(id: string, req: any): Promise<{
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
    processFile(id: string, req: any): Promise<{
        message: string;
    }>;
    downloadFile(id: string, req: any): Promise<{
        stream: import("fs").ReadStream;
        file: {
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
        };
    }>;
}
