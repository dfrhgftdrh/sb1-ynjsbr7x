import React from 'react';
import { ChatHistory } from '../../components/ChatHistory';

export default function ChatPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Chat History</h1>
      <div className="max-w-3xl mx-auto">
        <ChatHistory />
      </div>
    </div>
  );
}