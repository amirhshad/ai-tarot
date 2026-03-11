'use client';

import { useEffect, useRef, useState } from 'react';

interface InterpretationStreamProps {
  readingId: string;
  onComplete: (fullText: string) => void;
  onError?: (error: string) => void;
}

export default function InterpretationStream({
  readingId,
  onComplete,
  onError,
}: InterpretationStreamProps) {
  const [text, setText] = useState('');
  const [isStreaming, setIsStreaming] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function startStream() {
      try {
        const response = await fetch(`/api/reading/${readingId}/stream`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Failed to start reading stream');
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No reader available');

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                setText(prev => prev + data.text);
              }
              if (data.done) {
                setIsStreaming(false);
                onComplete(data.fullText);
              }
              if (data.error) {
                setIsStreaming(false);
                onError?.(data.error);
              }
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setIsStreaming(false);
          onError?.((err as Error).message);
        }
      }
    }

    startStream();
    return () => controller.abort();
  }, [readingId, onComplete, onError]);

  // Auto-scroll as text streams in
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [text]);

  return (
    <div ref={containerRef} className="max-h-96 overflow-y-auto">
      <div className="prose prose-invert prose-purple max-w-none">
        <p className="text-purple-100 leading-relaxed whitespace-pre-wrap">
          {text}
          {isStreaming && (
            <span className="inline-block w-2 h-4 bg-amber-400 animate-pulse ml-0.5" />
          )}
        </p>
      </div>
    </div>
  );
}
