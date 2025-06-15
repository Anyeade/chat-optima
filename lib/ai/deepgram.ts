import fetch from 'node-fetch';

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY || '480a1fe60f58ad7626d3350b1c5ecc2fc22c557e';

export interface DeepgramWord {
  word: string;
  start: number;
  end: number;
}

export async function transcribeAudioWithDeepgram(audioBuffer: Buffer): Promise<DeepgramWord[]> {
  const response = await fetch('https://api.deepgram.com/v1/listen?punctuate=true&timestamps=true', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${DEEPGRAM_API_KEY}`,
      'Content-Type': 'audio/mp3',
    },
    body: audioBuffer,
  });

  if (!response.ok) {
    throw new Error(`Deepgram error: ${await response.text()}`);
  }

  const result = await response.json() as {
    results?: {
      channels?: Array<{
        alternatives?: Array<{
          words?: DeepgramWord[];
        }>;
      }>;
    };
  };
  const alt = result?.results?.channels?.[0]?.alternatives?.[0];
  const words: DeepgramWord[] = alt?.words || [];
  return words;
}
