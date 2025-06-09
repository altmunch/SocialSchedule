import { NextRequest, NextResponse } from 'next/server';
import { suggestCaptionsAndHashtags } from '@/app/workflows/AI_improvement/functions/nlp';

export async function POST(req: NextRequest) {
  const { caption, hashtags } = await req.json();
  if (!caption) {
    return NextResponse.json({ error: 'Caption is required' }, { status: 400 });
  }
  const variations = suggestCaptionsAndHashtags({ caption, hashtags });
  return NextResponse.json({
    caption,
    hashtags,
    variations,
  });
} 