import fs from 'fs';
import path from 'path';

export interface UploadOptions {
  fileName: string;
  fileBuffer: Buffer;
  mimeType: string;
  eventName: string;
  eventDate: string; // YYYY-MM-DD
  categoryFolder: 'RawPhotos' | 'GeoTagged' | 'Videos' | 'FinalReel';
}

export interface StoredFile {
  fileId: string;
  fileName: string;
  drivePath: string;
  mimeType: string;
  size: number;
}

export interface IStorageProvider {
  uploadFile(options: UploadOptions): Promise<StoredFile>;
  getFileStream(fileId: string): Promise<{ stream: NodeJS.ReadableStream; mimeType: string; fileName: string }>;
  deleteFile(fileId: string): Promise<boolean>;
}

// Local FileSystem Storage Fallback Provider
export class LocalStorageProvider implements IStorageProvider {
  private baseDir: string;

  constructor() {
    this.baseDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async uploadFile(options: UploadOptions): Promise<StoredFile> {
    const safeEventName = options.eventName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const folderPath = path.join('KJIT', `${safeEventName}_${options.eventDate}`, options.categoryFolder);
    const fullDirPath = path.join(this.baseDir, folderPath);

    if (!fs.existsSync(fullDirPath)) {
      fs.mkdirSync(fullDirPath, { recursive: true });
    }

    const fileId = `loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const targetFilePath = path.join(fullDirPath, `${fileId}_${options.fileName}`);

    fs.writeFileSync(targetFilePath, options.fileBuffer);

    return {
      fileId,
      fileName: options.fileName,
      drivePath: path.join(folderPath, options.fileName).replace(/\\/g, '/'),
      mimeType: options.mimeType,
      size: options.fileBuffer.length,
    };
  }

  async getFileStream(fileId: string): Promise<{ stream: NodeJS.ReadableStream; mimeType: string; fileName: string }> {
    // Find file recursively in uploads directory
    const findFile = (dir: string): string | null => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          const res = findFile(fullPath);
          if (res) return res;
        } else if (entry.name.startsWith(fileId)) {
          return fullPath;
        }
      }
      return null;
    };

    const filePath = findFile(this.baseDir);
    if (!filePath || !fs.existsSync(filePath)) {
      throw new Error(`File not found: ${fileId}`);
    }

    const fileName = path.basename(filePath).replace(`${fileId}_`, '');
    const ext = path.extname(fileName).toLowerCase();
    let mimeType = 'application/octet-stream';
    if (['.jpg', '.jpeg'].includes(ext)) mimeType = 'image/jpeg';
    if (ext === '.png') mimeType = 'image/png';
    if (ext === '.mp4') mimeType = 'video/mp4';
    if (ext === '.pdf') mimeType = 'application/pdf';

    const stream = fs.createReadStream(filePath);
    return { stream, mimeType, fileName };
  }

  async deleteFile(fileId: string): Promise<boolean> {
    const findAndUnlink = (dir: string): boolean => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (findAndUnlink(fullPath)) return true;
        } else if (entry.name.startsWith(fileId)) {
          fs.unlinkSync(fullPath);
          return true;
        }
      }
      return false;
    };

    return findAndUnlink(this.baseDir);
  }
}

// Google Drive API v3 Storage Provider
export class GoogleDriveStorageProvider implements IStorageProvider {
  private driveService: any;
  private rootFolderId: string;

  constructor() {
    const keyFile = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    this.rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID || '';

    if (!keyFile) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY env missing');
    }

    const credentials = typeof keyFile === 'string' ? JSON.parse(keyFile) : keyFile;
    const { google } = require('googleapis');
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive'],
    });

    this.driveService = google.drive({ version: 'v3', auth });
  }

  private async getOrCreateFolder(folderName: string, parentFolderId?: string): Promise<string> {
    const parent = parentFolderId || this.rootFolderId;
    let query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
    if (parent) {
      query += ` and '${parent}' in parents`;
    }

    const response = await this.driveService.files.list({
      q: query,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    if (response.data.files && response.data.files.length > 0) {
      return response.data.files[0].id;
    }

    const fileMetadata: any = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    };
    if (parent) {
      fileMetadata.parents = [parent];
    }

    const folder = await this.driveService.files.create({
      resource: fileMetadata,
      fields: 'id',
    });

    return folder.data.id;
  }

  async uploadFile(options: UploadOptions): Promise<StoredFile> {
    const kjitFolderId = await this.getOrCreateFolder('KJIT');
    const safeEventName = options.eventName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const eventFolderName = `${safeEventName}_${options.eventDate}`;
    const eventFolderId = await this.getOrCreateFolder(eventFolderName, kjitFolderId);
    const categoryFolderId = await this.getOrCreateFolder(options.categoryFolder, eventFolderId);

    const { Readable } = require('stream');
    const media = {
      mimeType: options.mimeType,
      body: Readable.from(options.fileBuffer),
    };

    const fileMetadata = {
      name: options.fileName,
      parents: [categoryFolderId],
    };

    const file = await this.driveService.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, name, mimeType, size',
    });

    const drivePath = `KJIT/${eventFolderName}/${options.categoryFolder}/${options.fileName}`;

    return {
      fileId: file.data.id,
      fileName: file.data.name,
      drivePath,
      mimeType: file.data.mimeType || options.mimeType,
      size: parseInt(file.data.size || '0', 10),
    };
  }

  async getFileStream(fileId: string): Promise<{ stream: NodeJS.ReadableStream; mimeType: string; fileName: string }> {
    const meta = await this.driveService.files.get({
      fileId: fileId,
      fields: 'name, mimeType',
    });

    const response = await this.driveService.files.get(
      { fileId: fileId, alt: 'media' },
      { responseType: 'stream' }
    );

    return {
      stream: response.data,
      mimeType: meta.data.mimeType,
      fileName: meta.data.name,
    };
  }

  async deleteFile(fileId: string): Promise<boolean> {
    await this.driveService.files.delete({ fileId });
    return true;
  }
}

// StorageService Factory & Unified Interface
class StorageService {
  private provider: IStorageProvider;

  constructor() {
    if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      try {
        this.provider = new GoogleDriveStorageProvider();
        console.log('[StorageService] Initialized with Google Drive Provider (v3 Service Account)');
      } catch (err) {
        console.warn('[StorageService] Failed to load Google Drive provider, falling back to Local Storage:', err);
        this.provider = new LocalStorageProvider();
      }
    } else {
      this.provider = new LocalStorageProvider();
      console.log('[StorageService] Initialized with Local File System Storage Provider');
    }
  }

  async uploadFile(options: UploadOptions): Promise<StoredFile> {
    return this.provider.uploadFile(options);
  }

  async getFileStream(fileId: string) {
    return this.provider.getFileStream(fileId);
  }

  async deleteFile(fileId: string) {
    return this.provider.deleteFile(fileId);
  }
}

export const storageService = new StorageService();
