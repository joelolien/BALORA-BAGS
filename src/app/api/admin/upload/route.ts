import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { uploadImage } from '@/lib/cloudinary';

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { dataUri } = await req.json();
  if (!dataUri) return NextResponse.json({ error: 'No image provided.' }, { status: 400 });

  try {
    const result = await uploadImage(dataUri);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Upload error:', err);
    const detail = err?.message || 'Unknown error';
    return NextResponse.json(
      { error: `Image upload failed: ${detail}` },
      { status: 500 }
    );
  }
}
