import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Clock, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  is_response: boolean;
}

export function ChatHistory() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-800/50 h-24 rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.length > 0 ? (
        messages.map((message) => (
          <div
            key={message.id}
            className={`p-4 rounded-lg ${
              message.is_response
                ? 'bg-blue-500/10 border border-blue-500/20'
                : 'bg-pink-500/10 border border-pink-500/20'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <MessageCircle size={16} className={message.is_response ? 'text-blue-400' : 'text-pink-400'} />
                <span className="text-sm text-gray-400">
                  {message.is_response ? 'Assistant' : 'You'}
                </span>
              </div>
              <div className="flex items-center gap-1 text-gray-400">
                <Clock size={14} />
                <span className="text-xs">
                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
            <p className="text-gray-200 whitespace-pre-wrap">{message.content}</p>
          </div>
        ))
      ) : (
        <div className="text-center py-8 text-gray-400">
          <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
          <p>No previous messages</p>
        </div>
      )}
    </div>
  );
}