import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, X, Search } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface AccountabilityPartnersSectionProps {
  goalId: string;
}

export function AccountabilityPartnersSection({ goalId }: AccountabilityPartnersSectionProps) {
  const { user } = useAuth();
  const [partners, setPartners] = useState<any[]>([]);
  const [circleMembers, setCircleMembers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    fetchPartners();
    fetchCircleMembers();
  }, [goalId]);

  const fetchPartners = async () => {
    const { data } = await supabase
      .from('goal_accountability_partners')
      .select('*, profiles:partner_id(id, full_name, email)')
      .eq('goal_id', goalId);
    setPartners(data || []);
  };

  const fetchCircleMembers = async () => {
    const { data } = await supabase
      .from('circle_members')
      .select('profiles:member_id(id, full_name, email)')
      .eq('user_id', user?.id);
    setCircleMembers(data?.map(d => d.profiles) || []);
  };

  const addPartner = async (partnerId: string) => {
    await supabase.from('goal_accountability_partners').insert({ goal_id: goalId, partner_id: partnerId });
    await fetchPartners();
    setShowSearch(false);
    setSearchQuery('');
  };

  const removePartner = async (id: string) => {
    await supabase.from('goal_accountability_partners').delete().eq('id', id);
    await fetchPartners();
  };

  const filteredMembers = circleMembers.filter(m => 
    !partners.some(p => p.partner_id === m.id) &&
    (m.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
     m.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-lg font-semibold">Accountability Partners</Label>
        <Button variant="outline" size="sm" onClick={() => setShowSearch(!showSearch)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      {showSearch && (
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search circle members..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {filteredMembers.map(m => (
              <div key={m.id} className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer" onClick={() => addPartner(m.id)}>
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{m.full_name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">{m.full_name || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">{m.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {partners.map(p => (
          <div key={p.id} className="flex items-center gap-2 p-2 rounded bg-muted">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{p.profiles?.full_name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <span className="flex-1 text-sm">{p.profiles?.full_name || 'Unknown'}</span>
            <Button variant="ghost" size="sm" onClick={() => removePartner(p.id)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
