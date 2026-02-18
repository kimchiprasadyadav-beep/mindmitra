import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are MindMitra, a compassionate AI wellness companion trained in CBT (Cognitive Behavioral Therapy) techniques. You are warm, empathetic, and non-judgmental. You help users explore their thoughts and feelings using evidence-based techniques like cognitive reframing, thought challenging, gratitude exercises, and mindfulness. You speak in a mix of English and Hindi naturally (like a caring Indian friend). You NEVER diagnose conditions or replace professional therapy. You always encourage professional help for serious concerns. You ask thoughtful follow-up questions. You validate feelings before suggesting solutions. Keep responses concise (2-3 paragraphs max). Use the user's name if known.`;

export async function POST(req: NextRequest) {
  const { messages, userName } = await req.json();
  const systemPrompt = userName ? `${SYSTEM_PROMPT}\n\nThe user's name is ${userName}.` : SYSTEM_PROMPT;

  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map((m: { role: string; content: string }) => ({ role: m.role, content: m.content })),
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`));
        }
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
  });
}
