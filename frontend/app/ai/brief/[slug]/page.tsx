'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';

interface StreamedResponse {
  type: 'text' | 'done' | 'error';
  content: string;
  error?: string;
}

export default function BriefAIToolsPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [brief, setBrief] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'analysis' | 'pricing' | 'communication'>('analysis');
  const [streamingResponse, setStreamingResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [followUpInput, setFollowUpInput] = useState('');
  const [selectedNeed, setSelectedNeed] = useState('proposal');
  const responseEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchBrief = async () => {
      try {
        const response = await api.get(`/briefs/${slug}/public_detail/`);
        setBrief(response.data);
      } catch (error) {
        console.error('Failed to load brief:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrief();
  }, [slug]);

  useEffect(() => {
    responseEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [streamingResponse]);

  const streamResponse = async (endpoint: string, body: any) => {
    setIsStreaming(true);
    setStreamingResponse('');
    setFollowUpInput('');

    try {
      const response = await api.post(endpoint, body, {
        responseType: 'stream'
      });

      const text = await response.data.text();
      const lines = text.split('\n').filter((line: string) => line.trim());

      for (const line of lines) {
        try {
          const chunk: StreamedResponse = JSON.parse(line);
          if (chunk.type === 'text') {
            // Stream text word by word
            setStreamingResponse((prev) => prev + chunk.content);
          } else if (chunk.type === 'error') {
            setStreamingResponse((prev) => prev + `\n\nError: ${chunk.error}`);
          }
        } catch {
          // Skip invalid JSON
        }
      }
    } catch (error: any) {
      setStreamingResponse(`Error: ${error.message}`);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleAnalyzeBrief = () => {
    if (!brief?.id) return;
    streamResponse('/ai/conversations/analyze_brief/', {
      brief_id: brief.id,
      question: followUpInput || 'Provide comprehensive analysis and improvement suggestions',
    });
  };

  const handlePricingRecommendation = () => {
    if (!brief?.id) return;
    streamResponse('/ai/conversations/price_recommendation/', {
      brief_id: brief.id,
      context: followUpInput || 'Provide detailed pricing recommendations with market insights',
    });
  };

  const handleClientCommunication = () => {
    if (!brief?.id) return;
    streamResponse('/ai/conversations/client_communication/', {
      brief_id: brief.id,
      need: selectedNeed,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Loading brief...</div>
      </div>
    );
  }

  if (!brief) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Brief not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900 px-6 py-4">
        <Link href="/dashboard" className="text-indigo-500 hover:text-indigo-400 text-sm mb-2 block">
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-white">{brief.project_title}</h1>
        <p className="text-slate-400 text-sm mt-1">🤖 AI Analysis Tools</p>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-800 bg-slate-900 px-6 flex-shrink-0">
          {(['analysis', 'pricing', 'communication'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setStreamingResponse('');
              }}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition ${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              {tab === 'analysis'
                ? '📊 Analysis'
                : tab === 'pricing'
                ? '💰 Pricing'
                : '✉️ Communication'}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Response Display */}
          {streamingResponse ? (
            <div className="bg-slate-800 rounded-lg p-6 mb-6 max-h-96 overflow-y-auto">
              <pre className="text-slate-200 text-sm whitespace-pre-wrap font-sans leading-relaxed">
                {streamingResponse}
              </pre>
              {isStreaming && (
                <span className="inline-block ml-2 w-2 h-4 bg-slate-400 animate-pulse"></span>
              )}
              <div ref={responseEndRef} />
            </div>
          ) : (
            <div className="text-slate-400 text-center py-12">
              {activeTab === 'analysis' && 'Click "Analyze Brief" to get AI insights'}
              {activeTab === 'pricing' && 'Click "Get Pricing" for recommendations'}
              {activeTab === 'communication' && 'Select a template and click "Generate"'}
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="border-t border-slate-800 bg-slate-900 p-6 flex-shrink-0">
          {activeTab === 'analysis' && (
            <div className="space-y-3">
              <input
                type="text"
                value={followUpInput}
                onChange={(e) => setFollowUpInput(e.target.value)}
                placeholder="Ask a specific question about the brief (optional)..."
                className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isStreaming}
              />
              <button
                onClick={handleAnalyzeBrief}
                disabled={isStreaming}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                {isStreaming ? 'Analyzing...' : 'Analyze Brief'}
              </button>
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="space-y-3">
              <input
                type="text"
                value={followUpInput}
                onChange={(e) => setFollowUpInput(e.target.value)}
                placeholder="Add market context or specific concerns (optional)..."
                className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isStreaming}
              />
              <button
                onClick={handlePricingRecommendation}
                disabled={isStreaming}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                {isStreaming ? 'Generating...' : 'Get Pricing Recommendations'}
              </button>
            </div>
          )}

          {activeTab === 'communication' && (
            <div className="space-y-3">
              <select
                value={selectedNeed}
                onChange={(e) => setSelectedNeed(e.target.value)}
                className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isStreaming}
              >
                <option value="proposal">💼 Project Proposal</option>
                <option value="kickoff_email">📧 Kickoff Email</option>
                <option value="scope_clarification">❓ Scope Clarification</option>
                <option value="progress_update">📈 Progress Update</option>
                <option value="change_request">🔄 Change Request Handling</option>
                <option value="closing">✅ Project Closing Email</option>
              </select>
              <button
                onClick={handleClientCommunication}
                disabled={isStreaming}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                {isStreaming ? 'Generating...' : 'Generate Template'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
