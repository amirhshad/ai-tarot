/**
 * Convert an Anthropic message stream to a ReadableStream for Next.js responses.
 */
export function anthropicStreamToResponse(
  stream: AsyncIterable<{ type: string; delta?: { type?: string; text?: string } }>,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        let totalText = '';
        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta?.type === 'text_delta' &&
            event.delta?.text
          ) {
            totalText += event.delta.text;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`),
            );
          }
        }
        // Send done signal with full text for storage
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ done: true, fullText: totalText })}\n\n`),
        );
        controller.close();
      } catch {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: 'Stream error occurred' })}\n\n`,
          ),
        );
        controller.close();
      }
    },
  });
}
