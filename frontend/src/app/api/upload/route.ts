import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { mkdir, writeFile } from 'fs/promises';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string | null) || 'cms';

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier reçu.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', folder);
    await mkdir(uploadsDir, { recursive: true });

    const safeName = file.name.replace(/\s+/g, '-').toLowerCase();
    const fileName = `${Date.now()}-${safeName}`;
    const filePath = path.join(uploadsDir, fileName);

    await writeFile(filePath, buffer);

    const url = `/uploads/${folder}/${fileName}`;

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Upload error', error);
    return NextResponse.json(
      { error: 'Erreur lors du téléversement du fichier.' },
      { status: 500 }
    );
  }
}

