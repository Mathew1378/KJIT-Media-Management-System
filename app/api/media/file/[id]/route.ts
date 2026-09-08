import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { storageService } from '@/lib/storage/StorageService';
import { Readable } from 'stream';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const fileId = params.id;
    const { stream, mimeType, fileName } = await storageService.getFileStream(fileId);

    // Convert node stream to web ReadableStream for Next.js response
    const webStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk) => controller.enqueue(chunk));
        stream.on('end', () => controller.close());
        stream.on('error', (err) => controller.error(err));
      },
    });

    return new Response(webStream, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `inline; filename="${encodeURIComponent(fileName)}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (err: any) {
    console.error('[Stream File Error]', err);
    return NextResponse.json({ error: 'File not found or failed to stream' }, { status: 404 });
  }
}
