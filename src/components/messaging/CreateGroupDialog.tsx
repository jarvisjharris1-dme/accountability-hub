import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface CreateGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (groupId: string) => void;
  selectedMembers: string[];
}

export function CreateGroupDialog({ isOpen, onClose, onCreated, selectedMembers }: CreateGroupDialogProps) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);

    const { data: group, error: groupError } = await supabase
      .from('groups')
      .insert({ name, created_by: user.id })
      .select()
      .single();

    if (!groupError && group) {
      const members = [user.id, ...selectedMembers].map(userId => ({
        group_id: group.id,
        user_id: userId,
        role: userId === user.id ? 'admin' : 'member'
      }));

      await supabase.from('group_members').insert(members);
      onCreated(group.id);
      setName('');
    }
    setIsLoading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Group</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Group Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>Create</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
