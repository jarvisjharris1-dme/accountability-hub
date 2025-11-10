import { useState, useEffect } from 'react';
import { MediaItem } from '@/types';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image, Video, Music, File } from 'lucide-react';

interface MediaGalleryProps {
  groupId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function MediaGallery({ groupId, isOpen, onClose }: MediaGalleryProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'image' | 'video' | 'audio'>('all');

  useEffect(() => {
    if (isOpen) loadMedia();
  }, [groupId, isOpen]);

  const loadMedia = async () => {
    const { data } = await supabase
      .from('media_items')
      .select('*, profiles!media_items_user_id_fkey(full_name)')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (data) {
      setMedia(data.map(item => ({
        ...item,
        user_name: item.profiles?.full_name
      })));
    }
  };

  const filtered = filter === 'all' ? media : media.filter(m => m.media_type === filter);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="image"><Image className="w-4 h-4" /></TabsTrigger>
            <TabsTrigger value="video"><Video className="w-4 h-4" /></TabsTrigger>
            <TabsTrigger value="audio"><Music className="w-4 h-4" /></TabsTrigger>
          </TabsList>
          <TabsContent value={filter} className="grid grid-cols-3 gap-4 overflow-y-auto max-h-96">
            {filtered.map(item => (
              <div key={item.id} className="relative group">
                {item.media_type === 'image' && (
                  <img src={item.media_url} className="w-full h-32 object-cover rounded" />
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1">
                  {item.user_name}
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
