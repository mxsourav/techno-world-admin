import React, { useState, useRef, useEffect } from 'react';
import {
  Paperclip,
  Send,
  CheckCheck,
  PowerOff,
} from 'lucide-react';
import { toast } from 'sonner';

export interface ChatMessageItem {
  id: string;
  senderType: 'CUSTOMER' | 'ADMIN';
  content: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
}

interface ChatFeedProps {
  customerName: string;
  customerPhone: string;
  customerInitials: string;
  sessionStatus: 'OPEN' | 'CLOSED';
  messages: ChatMessageItem[];
  onSendMessage: (text: string) => void;
  onEndSession: () => void;
  orderNumber?: string;
}

export const ChatFeed: React.FC<ChatFeedProps> = ({
  customerName,
  customerPhone,
  customerInitials,
  sessionStatus,
  messages,
  onSendMessage,
  onEndSession,
  orderNumber,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const handleAttachmentClick = () => {
    toast.info('File attachment dialog (images/PDFs) ready for Meta WhatsApp Media API.');
  };

  return (
    <section className="flex-1 min-w-0 flex flex-col h-full bg-white/70 dark:bg-stone-900/70 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
      {/* Pane 2 Header */}
      <header className="px-5 py-3.5 border-b border-stone-200/50 dark:border-white/10 flex items-center justify-between gap-4 bg-white/40 dark:bg-stone-900/40 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 shrink-0 rounded-full bg-[#081C15] text-white flex items-center justify-center text-xs font-bold shadow-xs">
            {customerInitials}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                {customerName}
              </h1>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${
                sessionStatus === 'OPEN'
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-stone-500/10 text-stone-600 dark:text-stone-400 border-stone-500/20'
              }`}>
                {sessionStatus === 'OPEN' && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                {sessionStatus === 'OPEN' ? 'Active Session' : 'Closed Session'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              <span className="font-mono text-[11px]">{customerPhone}</span>
              {orderNumber && (
                <>
                  <span>&bull;</span>
                  <span className="font-mono text-[10px] bg-stone-100 dark:bg-stone-800 px-1.5 py-0.2 rounded text-stone-600 dark:text-stone-300">
                    Ref: {orderNumber}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* macOS Native Destructive Button: [ End Session ] */}
        <button
          type="button"
          onClick={onEndSession}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 active:bg-rose-500/30 border border-rose-500/20 transition-all cursor-pointer shadow-xs active:scale-95"
          title="End this WhatsApp support session"
        >
          <PowerOff className="h-3 w-3" />
          <span>End Session</span>
        </button>
      </header>

      {/* Live Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {/* Date Separator */}
        <div className="flex items-center justify-center my-2">
          <span className="px-3 py-1 rounded-full text-[10px] font-semibold tracking-wide bg-stone-100/90 dark:bg-stone-800/90 text-stone-500 dark:text-stone-400 border border-stone-200/50 dark:border-white/5 shadow-xs">
            TODAY &bull; WHATSAPP CLOUD API ENCRYPTED
          </span>
        </div>

        {/* Message Bubbles */}
        {messages.map((msg, index) => {
          const isAdmin = msg.senderType === 'ADMIN';
          const isConsecutive =
            index > 0 && messages[index - 1].senderType === msg.senderType;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'} ${
                isConsecutive ? 'mt-1' : 'mt-3'
              }`}
            >
              <div
                className={`max-w-[80%] sm:max-w-[70%] p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed transition-all ${
                  isAdmin
                    ? 'bg-[#081C15] text-white rounded-2xl rounded-tr-xs shadow-xs'
                    : 'bg-white/90 dark:bg-stone-800/90 backdrop-blur-md border border-stone-200/50 dark:border-white/10 text-stone-900 dark:text-stone-100 rounded-2xl rounded-tl-xs shadow-xs'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>

                {/* Bubble Footer */}
                <div
                  className={`flex items-center justify-end gap-1.5 mt-1.5 text-[10px] ${
                    isAdmin ? 'text-emerald-200/70' : 'text-stone-400'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {isAdmin && (
                    <CheckCheck className="h-3 w-3 text-emerald-300 shrink-0" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Frosted Glass Input Area */}
      <footer className="p-3.5 sm:p-4 bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border-t border-stone-200/50 dark:border-white/10">
        <form onSubmit={handleSend} className="flex items-end gap-2.5">
          {/* Attachment Paperclip */}
          <button
            type="button"
            onClick={handleAttachmentClick}
            className="p-2.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-white/5 transition-colors cursor-pointer shrink-0"
            title="Attach file or invoice"
          >
            <Paperclip className="h-4 w-4" />
          </button>

          {/* Text Input / Expanding Textarea */}
          <div className="flex-1 relative">
            <textarea
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a human response to customer via WhatsApp... (Press Enter to send)"
              className="w-full resize-none max-h-32 bg-stone-100/70 dark:bg-stone-800/70 border border-stone-200/60 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-emerald-700/40 transition-all leading-normal"
            />
          </div>

          {/* Forest Green Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim()}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer ${
              inputText.trim()
                ? 'bg-[#081C15] hover:bg-[#0E2E22] text-white active:scale-95'
                : 'bg-stone-200 dark:bg-stone-800 text-stone-400 cursor-not-allowed opacity-60'
            }`}
          >
            <Send className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </footer>
    </section>
  );
};
