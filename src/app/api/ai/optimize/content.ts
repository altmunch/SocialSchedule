import { NextRequest, NextResponse } from 'next/server';
import { analyzeSentiment, analyzeTone, suggestCaptionsAndHashtags } from '@/app/workflows/AI_improvement/functions/nlp';

async function POST(req: NextRequest) {
  const { caption, hashtags } = await req.json();
  if (!caption) {
    return NextResponse.json({ error: 'Caption is required' }, { status: 400 });
  }
  const sentiment = analyzeSentiment(caption);
  const tone = analyzeTone(caption);
  const suggestions = suggestCaptionsAndHashtags({ caption, hashtags });
  return NextResponse.json({
    sentiment,
    tone,
    suggestions,
  });
}

export { POST }; 