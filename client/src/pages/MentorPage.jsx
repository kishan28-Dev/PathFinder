import { useEffect, useRef, useState } from 'react';
import { Send, Sparkles, MessageCircle } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getMentorHistory, sendMentorMessage } from '../services/mentorApi';
import { getErrorMessage } from '../services/api';

const SUGGESTIONS = [
  "What should I learn this week?",
  "I don't understand this topic. Can you explain it simply?",
  'Give me a project to practice my current skills.',
  'Can I skip ahead in my roadmap?',
];

export default function MentorPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    getMentorHistory()
      .then(setMessages)
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const send = async (text) => {
    const message = (text ?? input).trim();
    if (!message || sending) return;

    setMessages((m) => [...m, { role: 'user', content: message, _id: `local-${Date.now()}` }]);
    setInput('');
    setSending(true);
    setError('');

    try {
      const { reply } = await sendMentorMessage(message);
      setMessages((m) => [...m, { role: 'assistant', content: reply, _id: `local-${Date.now()}-r` }]);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen label="Loading your mentor..." />;

  return (
    <div className="flex h-[calc(100vh-8.5rem)] flex-col">
      <Card className="flex flex-1 flex-col overflow-hidden p-0">
        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
          <MessageCircle className="h-5 w-5 text-brand-600" />
          <h2 className="font-semibold text-slate-900">AI Career Mentor</h2>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center text-slate-400">
              <Sparkles className="mb-3 h-8 w-8 text-brand-300" />
              <p className="text-sm">Ask me anything about your roadmap, a topic you're stuck on, or what to learn next.</p>
              <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-left text-xs text-slate-600 hover:border-brand-300 hover:bg-brand-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div key={m._id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === 'user' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-slate-100 px-4 py-2.5 text-sm text-slate-400">Thinking...</div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {error && <p className="px-5 pb-1 text-xs text-red-600">{error}</p>}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex items-center gap-2 border-t border-slate-100 p-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your mentor anything..."
            className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <Button type="submit" loading={sending} disabled={!input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </Card>
    </div>
  );
}
