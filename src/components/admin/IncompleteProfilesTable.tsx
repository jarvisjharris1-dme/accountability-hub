import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Loader2, RefreshCw, UserPlus } from 'lucide-react';

interface IncompleteUser {
  id: string;
  email: string;
  created_at: string;
  has_profile: boolean;
}

export function IncompleteProfilesTable() {
  const [users, setUsers] = useState<IncompleteUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [repairing, setRepairing] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const fetchIncompleteProfiles = async () => {
    setLoading(true);
    try {
      const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) throw authError;

      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id');

      if (profileError) throw profileError;

      const profileIds = new Set(profiles?.map(p => p.id) || []);
      
      const incomplete = authUsers
        .filter(u => !profileIds.has(u.id))
        .map(u => ({
          id: u.id,
          email: u.email || 'No email',
          created_at: u.created_at,
          has_profile: false
        }));

      setUsers(incomplete);
    } catch (error: any) {
      toast.error('Failed to load incomplete profiles: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncompleteProfiles();
  }, []);

  const handleRepair = async (userIds: string[]) => {
    setRepairing(true);
    try {
      const { data, error } = await supabase.functions.invoke('repair-user-profiles', {
        body: { userIds, action: 'create' }
      });

      if (error) throw error;

      toast.success(`Repaired ${data.success.length} of ${data.total} profiles`);
      
      if (data.failed.length > 0) {
        toast.error(`Failed to repair ${data.failed.length} profiles`);
      }

      setSelected(new Set());
      await fetchIncompleteProfiles();
    } catch (error: any) {
      toast.error('Repair failed: ' + error.message);
    } finally {
      setRepairing(false);
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  const selectAll = () => {
    if (selected.size === users.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(users.map(u => u.id)));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Incomplete Profiles</h3>
          <p className="text-sm text-muted-foreground">
            Users who signed up but don't have profile records
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchIncompleteProfiles} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={() => handleRepair(Array.from(selected))} 
            disabled={selected.size === 0 || repairing}
            size="sm"
          >
            {repairing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
            Repair Selected ({selected.size})
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No incomplete profiles found
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox 
                  checked={selected.size === users.length && users.length > 0}
                  onCheckedChange={selectAll}
                />
              </TableHead>
              <TableHead>Email</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Checkbox 
                    checked={selected.has(user.id)}
                    onCheckedChange={() => toggleSelect(user.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{user.email}</TableCell>
                <TableCell className="font-mono text-xs">{user.id.slice(0, 8)}...</TableCell>
                <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant="destructive">No Profile</Badge>
                </TableCell>
                <TableCell>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleRepair([user.id])}
                    disabled={repairing}
                  >
                    Repair
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}