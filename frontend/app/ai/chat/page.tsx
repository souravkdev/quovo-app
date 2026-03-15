'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Protected by backend; unauthenticated users will be redirected via 401 handling.
  }, [router]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Add user message to UI immediately
    const userMsg = input;
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setLoading(true);

    // Add placeholder for assistant message
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    try {
      const response = await api.post('/ai/conversations/chat/', {
        message: userMsg,
        conversation_id: conversationId,
      }, {
        responseType: 'stream'
      });

      // Parse streaming response line by line
      const text = await response.data.text();
      const lines = text.split('\n').filter((line: string) => line.trim());

      for (const line of lines) {
        try {
          const chunk = JSON.parse(line);
          if (chunk.type === 'text') {
            // Update assistant message with streaming text (word by word effect)
            setMessages((prev) => {
              const updated = [...prev];
              const lastMsg = updated[updated.length - 1];
              if (lastMsg.role === 'assistant') {
                lastMsg.content += chunk.content;
              }
              return updated;
            });
          }
        } catch {
          // Skip invalid JSON
        }
      }
    } catch (error: any) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].content = `Error: ${error.message || 'Failed to get response'}`;
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-medium tracking-tight text-white">
          qu<span className="text-indigo-500">o</span>vo
        </Link>
        <div className="text-sm text-slate-400">💬 AI Chat Assistant</div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Ask AI anything</h2>
              <p className="text-slate-400">Get help with projects, pricing, communication, and more</p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-2xl px-4 py-3 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-100'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                  {msg.content}
                  {msg.role === 'assistant' && loading && idx === messages.length - 1 && (
                    <span className="inline-block ml-1 w-2 h-4 bg-slate-400 animate-pulse"></span>
                  )}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <div className="border-t border-slate-800 bg-slate-900 p-6">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
            className="flex-1 bg-slate-800 text-white border border-slate-700 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition placeholder-slate-500"
            disabled={loading}
            autoFocus
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 text-white px-6 py-3 rounded-full font-medium transition shrink-0"
          >
            {loading ? (
              <span className="flex gap-1">
                <span className="w-1 h-1 bg-white rounded-full animate-bounce"></span>
                <span className="w-1 h-1 bg-white rounded-full animate-bounce delay-100"></span>
                <span className="w-1 h-1 bg-white rounded-full animate-bounce delay-200"></span>
              </span>
            ) : (
              '↑'
            )}
          </button>
        </form>
        <p className="text-xs text-slate-500 mt-3 text-center">
          Powered by Ollama • Local LLM • No data sent anywhere
        </p>
      </div>
    </div>
  );
}
