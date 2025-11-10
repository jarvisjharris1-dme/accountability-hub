import { useState } from 'react';
import { Message } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, CheckCheck, Smile, Reply, Pin, PinOff, Pencil, Trash2 } from 'lucide-react';
import { highlightText } from '@/utils/highlightText';
import { VoiceMessagePlayer } from './VoiceMessagePlayer';
import { ReactionPicker } from './ReactionPicker';
import { ReactionDisplay } from './ReactionDisplay';
import { PinMessageDialog } from './PinMessageDialog';
import { EditMessageDialog } from './EditMessageDialog';
import { DeleteMessageDialog } from './DeleteMessageDialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';



interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  searchQuery?: string;
  onAddReaction?: (messageId: string, emoji: string) => void;
  onRemoveReaction?: (messageId: string, emoji: string) => void;
  onReply?: (message: Message) => void;
  onNavigateToReply?: (messageId: string) => void;
  onPin?: (messageId: string, note?: string) => void;
  onUnpin?: (messageId: string) => void;
  onEdit?: (messageId: string, newContent: string) => void;
  onDelete?: (messageId: string) => void;
}





export function MessageBubble({ message, isOwn, searchQuery, onAddReaction, onRemoveReaction, onReply, onNavigateToReply, onPin, onUnpin, onEdit, onDelete }: MessageBubbleProps) {

  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);


  const time = new Date(message.created_at).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const displayContent = searchQuery ? highlightText(message.content, searchQuery) : message.content;

  const handleAddReaction = (emoji: string) => {
    onAddReaction?.(message.id, emoji);
    setShowReactionPicker(false);
  };

  const handleReactionClick = (emoji: string) => {
    // Check if user already reacted with this emoji, if so remove it
    const userReaction = message.reactions?.find(r => r.emoji === emoji);
    if (userReaction) {
      onRemoveReaction?.(message.id, emoji);
    } else {
      onAddReaction?.(message.id, emoji);
    }
  };

  const getReadStatus = () => {
    if (!isOwn) return null;
    
    if (message.read_at) {
      const readTime = new Date(message.read_at).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
      return (
        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
          <CheckCheck className="w-3 h-3 text-blue-500" />
          <span>Seen {readTime}</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
        <CheckCheck className="w-3 h-3" />
        <span>Delivered</span>
      </div>
    );
  };

  const isVoiceMessage = message.message_type === 'voice';

  return (
    <>
      <div className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'} group`}>
        {!isOwn && (
          <Avatar className="w-8 h-8">
            <AvatarImage src={message.sender_avatar} />
            <AvatarFallback>{message.sender_name?.[0]}</AvatarFallback>
          </Avatar>
        )}
        <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
          {message.reply_to_message && (
            <div 
              onClick={() => onNavigateToReply?.(message.reply_to_message_id!)}
              className={`mb-1 px-3 py-1.5 rounded-lg text-xs cursor-pointer hover:opacity-80 transition-opacity ${
                isOwn ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'
              }`}
            >
              <div className="font-semibold">{message.reply_to_message.sender_name}</div>
              <div className="truncate max-w-[200px]">
                {message.reply_to_message.message_type === 'voice' 
                  ? '🎤 Voice message' 
                  : message.reply_to_message.content}
              </div>
            </div>
          )}
          
          <div className="relative">
            <div
              className={`px-4 py-2 rounded-2xl ${
                isOwn ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'
              }`}
            >
              {isVoiceMessage && message.audio_url ? (
                <VoiceMessagePlayer 
                  audioUrl={message.audio_url} 
                  duration={message.audio_duration || 0} 
                />
              ) : searchQuery ? (
                <p className="text-sm" dangerouslySetInnerHTML={{ __html: displayContent }} />
              ) : (
                <p className="text-sm">{message.content}</p>
              )}
            </div>
            
            <div className="absolute -bottom-2 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReply?.(message)}
                className="h-6 w-6 p-0 rounded-full bg-white dark:bg-gray-800 shadow-md"
              >
                <Reply className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => message.is_pinned ? onUnpin?.(message.id) : setShowPinDialog(true)}
                className="h-6 w-6 p-0 rounded-full bg-white dark:bg-gray-800 shadow-md"
              >
                {message.is_pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
              </Button>
              
              {isOwn && !isVoiceMessage && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEditDialog(true)}
                    className="h-6 w-6 p-0 rounded-full bg-white dark:bg-gray-800 shadow-md"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                    className="h-6 w-6 p-0 rounded-full bg-white dark:bg-gray-800 shadow-md"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              )}
              
              <Popover open={showReactionPicker} onOpenChange={setShowReactionPicker}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 rounded-full bg-white dark:bg-gray-800 shadow-md"
                  >
                    <Smile className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <ReactionPicker onSelectReaction={handleAddReaction} />
                </PopoverContent>
              </Popover>
            </div>


          </div>

          {message.reactions && message.reactions.length > 0 && (
            <ReactionDisplay reactions={message.reactions} onReactionClick={handleReactionClick} />
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{time}</span>
            {message.edited_at && (
              <span className="text-xs text-gray-400 italic">(edited)</span>
            )}
          </div>
          {getReadStatus()}

        </div>
      </div>
      
      <PinMessageDialog 
        open={showPinDialog} 
        onOpenChange={setShowPinDialog}
        onConfirm={(note) => onPin?.(message.id, note)}
      />
      
      <EditMessageDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        currentContent={message.content}
        onSave={(newContent) => onEdit?.(message.id, newContent)}
      />
      
      <DeleteMessageDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={() => onDelete?.(message.id)}
      />
    </>

  );
}



