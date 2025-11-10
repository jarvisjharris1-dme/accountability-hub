import { useState } from 'react';
import { ConversationList } from '../messaging/ConversationList';
import { ChatWindow } from '../messaging/ChatWindow';
import { MessageSearchBar } from '../messaging/MessageSearchBar';

export function MessagingSection() {
  const [selectedConversation, setSelectedConversation] = useState<{
    id: string;
    name: string;
    avatar?: string;
    isGroup: boolean;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightMessageId, setHighlightMessageId] = useState<string>();

  const handleSelectConversation = (id: string, name: string, avatar?: string, isGroup = false) => {
    setSelectedConversation({ id, name, avatar, isGroup });
    setSearchQuery('');
    setHighlightMessageId(undefined);
  };

  const handleSearchResult = (messageId: string, conversationId: string, conversationName: string) => {
    setSelectedConversation({ 
      id: conversationId, 
      name: conversationName, 
      avatar: undefined,
      isGroup: false 
    });
    setHighlightMessageId(messageId);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm h-[600px] flex">
      <div className="w-80 border-r flex flex-col">
        <MessageSearchBar 
          onSearchResult={handleSearchResult}
          currentUserId={selectedConversation?.id}
        />
        <ConversationList 
          onSelectConversation={handleSelectConversation}
          selectedId={selectedConversation?.id}
        />
      </div>
      
      <div className="flex-1">
        {selectedConversation ? (
          <ChatWindow 
            recipientId={selectedConversation.isGroup ? undefined : selectedConversation.id}
            recipientName={selectedConversation.name}
            recipientAvatar={selectedConversation.avatar}
            groupId={selectedConversation.isGroup ? selectedConversation.id : undefined}
            highlightMessageId={highlightMessageId}
            searchQuery={searchQuery}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
