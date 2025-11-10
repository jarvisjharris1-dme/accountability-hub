import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Ban, CheckCircle, Mail, MapPin, Download, Send, ArrowUpDown, ArrowUp, ArrowDown, Shield, KeyRound, Activity } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { BulkNotificationDialog } from './BulkNotificationDialog';
import { UserFilters } from './UserFilters';
import { FilterChips, createFilterChips } from './FilterChips';
import { RoleManagementDialog } from './RoleManagementDialog';
import { PasswordResetDialog } from './PasswordResetDialog';
import { UserActivityLog } from './UserActivityLog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';


interface User {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  is_suspended?: boolean;
  last_login_at?: string;
  last_login_location?: string;
  created_at: string;
  email_verified?: boolean;
}

interface UserManagementTableProps {
  users: User[];
  onUserUpdate: () => void;
}

type SortField = 'full_name' | 'email' | 'created_at' | 'last_login_at';
type SortDirection = 'asc' | 'desc' | null;

export const UserManagementTable: React.FC<UserManagementTableProps> = ({ users, onUserUpdate }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);


  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [registrationDateFrom, setRegistrationDateFrom] = useState<Date | undefined>();
  const [registrationDateTo, setRegistrationDateTo] = useState<Date | undefined>();
  const [lastLoginDateFrom, setLastLoginDateFrom] = useState<Date | undefined>();
  const [lastLoginDateTo, setLastLoginDateTo] = useState<Date | undefined>();

  // Sort states
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter(user => {
      // Text search
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        if (!user.full_name.toLowerCase().includes(search) && !user.email.toLowerCase().includes(search)) {
          return false;
        }
      }

      // Status filter
      if (statusFilter === 'active' && user.is_suspended) return false;
      if (statusFilter === 'suspended' && !user.is_suspended) return false;

      // Email verification filter
      if (verificationFilter === 'verified' && !user.email_verified) return false;
      if (verificationFilter === 'unverified' && user.email_verified) return false;

      // Registration date range
      if (registrationDateFrom) {
        const createdAt = new Date(user.created_at);
        if (createdAt < registrationDateFrom) return false;
      }
      if (registrationDateTo) {
        const createdAt = new Date(user.created_at);
        if (createdAt > registrationDateTo) return false;
      }

      // Last login date range
      if (lastLoginDateFrom && user.last_login_at) {
        const lastLogin = new Date(user.last_login_at);
        if (lastLogin < lastLoginDateFrom) return false;
      }
      if (lastLoginDateTo && user.last_login_at) {
        const lastLogin = new Date(user.last_login_at);
        if (lastLogin > lastLoginDateTo) return false;
      }

      return true;
    });

    // Sort
    if (sortField && sortDirection) {
      filtered.sort((a, b) => {
        let aVal: any = a[sortField];
        let bVal: any = b[sortField];

        if (sortField === 'created_at' || sortField === 'last_login_at') {
          aVal = aVal ? new Date(aVal).getTime() : 0;
          bVal = bVal ? new Date(bVal).getTime() : 0;
        } else {
          aVal = aVal?.toLowerCase() || '';
          bVal = bVal?.toLowerCase() || '';
        }

        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [users, searchTerm, statusFilter, verificationFilter, registrationDateFrom, registrationDateTo, lastLoginDateFrom, lastLoginDateTo, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setVerificationFilter('all');
    setRegistrationDateFrom(undefined);
    setRegistrationDateTo(undefined);
    setLastLoginDateFrom(undefined);
    setLastLoginDateTo(undefined);
  };

  const filterChips = createFilterChips(
    searchTerm,
    statusFilter,
    verificationFilter,
    registrationDateFrom,
    registrationDateTo,
    lastLoginDateFrom,
    lastLoginDateTo,
    {
      onClearSearch: () => setSearchTerm(''),
      onClearStatus: () => setStatusFilter('all'),
      onClearVerification: () => setVerificationFilter('all'),
      onClearRegFrom: () => setRegistrationDateFrom(undefined),
      onClearRegTo: () => setRegistrationDateTo(undefined),
      onClearLoginFrom: () => setLastLoginDateFrom(undefined),
      onClearLoginTo: () => setLastLoginDateTo(undefined),
    }
  );


  const toggleSuspension = async (userId: string, currentStatus: boolean) => {
    setLoading(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_suspended: !currentStatus })
        .eq('id', userId);

      if (error) throw error;
      toast.success(`User ${!currentStatus ? 'suspended' : 'activated'} successfully`);
      onUserUpdate();
    } catch (error) {
      toast.error('Failed to update user status');
    } finally {
      setLoading(null);
    }
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(u => u.id)));
    }
  };

  const toggleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const bulkSuspend = async () => {
    setLoading('bulk');
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_suspended: true })
        .in('id', Array.from(selectedUsers));

      if (error) throw error;
      toast.success(`${selectedUsers.size} users suspended`);
      setSelectedUsers(new Set());
      onUserUpdate();
    } catch (error) {
      toast.error('Failed to suspend users');
    } finally {
      setLoading(null);
    }
  };

  const bulkActivate = async () => {
    setLoading('bulk');
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_suspended: false })
        .in('id', Array.from(selectedUsers));

      if (error) throw error;
      toast.success(`${selectedUsers.size} users activated`);
      setSelectedUsers(new Set());
      onUserUpdate();
    } catch (error) {
      toast.error('Failed to activate users');
    } finally {
      setLoading(null);
    }
  };

  const exportToCSV = () => {
    const selectedUserData = users.filter(u => selectedUsers.has(u.id));
    const csvContent = [
      ['Name', 'Email', 'Status', 'Created At', 'Last Login'].join(','),
      ...selectedUserData.map(u => [
        u.full_name,
        u.email,
        u.is_suspended ? 'Suspended' : 'Active',
        new Date(u.created_at).toLocaleDateString(),
        u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : 'Never'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('User data exported successfully');
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      <UserFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        verificationFilter={verificationFilter}
        onVerificationChange={setVerificationFilter}
        registrationDateFrom={registrationDateFrom}
        registrationDateTo={registrationDateTo}
        onRegistrationDateFromChange={setRegistrationDateFrom}
        onRegistrationDateToChange={setRegistrationDateTo}
        lastLoginDateFrom={lastLoginDateFrom}
        lastLoginDateTo={lastLoginDateTo}
        onLastLoginDateFromChange={setLastLoginDateFrom}
        onLastLoginDateToChange={setLastLoginDateTo}
        onClearFilters={clearAllFilters}
      />

      <FilterChips chips={filterChips} />

      {selectedUsers.size > 0 && (
        <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
          <span className="text-sm font-medium">{selectedUsers.size} selected</span>
          <Button size="sm" variant="destructive" onClick={bulkSuspend} disabled={loading === 'bulk'}>
            <Ban className="h-4 w-4 mr-2" />
            Suspend Selected
          </Button>
          <Button size="sm" variant="default" onClick={bulkActivate} disabled={loading === 'bulk'}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Activate Selected
          </Button>
          <Button size="sm" variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button size="sm" variant="outline" onClick={() => setNotificationDialogOpen(true)}>
            <Send className="h-4 w-4 mr-2" />
            Send Notification
          </Button>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 font-medium text-sm">
          <div className="col-span-1 flex items-center">
            <Checkbox
              checked={selectedUsers.size === filteredAndSortedUsers.length && filteredAndSortedUsers.length > 0}
              onCheckedChange={toggleSelectAll}
            />
          </div>
          <button onClick={() => handleSort('full_name')} className="col-span-3 flex items-center gap-2 hover:text-primary">
            Name <SortIcon field="full_name" />
          </button>
          <button onClick={() => handleSort('email')} className="col-span-3 flex items-center gap-2 hover:text-primary">
            Email <SortIcon field="email" />
          </button>
          <button onClick={() => handleSort('created_at')} className="col-span-2 flex items-center gap-2 hover:text-primary">
            Registered <SortIcon field="created_at" />
          </button>
          <button onClick={() => handleSort('last_login_at')} className="col-span-2 flex items-center gap-2 hover:text-primary">
            Last Login <SortIcon field="last_login_at" />
          </button>
          <div className="col-span-1 text-center">Actions</div>
        </div>

        {filteredAndSortedUsers.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No users found matching the current filters.
          </div>
        ) : (
          filteredAndSortedUsers.map((user) => (
            <div key={user.id} className="grid grid-cols-12 gap-4 p-4 border-t items-center hover:bg-muted/30">
              <div className="col-span-1 flex items-center">
                <Checkbox
                  checked={selectedUsers.has(user.id)}
                  onCheckedChange={() => toggleSelectUser(user.id)}
                />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback>{user.full_name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-sm">{user.full_name}</div>
                  {user.email_verified && (
                    <Badge variant="outline" className="text-xs">Verified</Badge>
                  )}
                </div>
              </div>
              <div className="col-span-2 flex items-center gap-1 text-sm">
                <Mail className="h-3 w-3 text-muted-foreground" />
                {user.email}
              </div>
              <div className="col-span-2 text-sm text-muted-foreground">
                {new Date(user.created_at).toLocaleDateString()}
              </div>
              <div className="col-span-2 text-sm text-muted-foreground">
                {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never'}
              </div>
              <div className="col-span-3 flex items-center justify-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setSelectedUser(user); setRoleDialogOpen(true); }}
                  title="Manage Role"
                >
                  <Shield className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setSelectedUser(user); setPasswordDialogOpen(true); }}
                  title="Reset Password"
                >
                  <KeyRound className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setSelectedUser(user); setActivityDialogOpen(true); }}
                  title="View Activity"
                >
                  <Activity className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant={user.is_suspended ? 'default' : 'destructive'}
                  onClick={() => toggleSuspension(user.id, user.is_suspended || false)}
                  disabled={loading === user.id}
                >
                  {user.is_suspended ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {filteredAndSortedUsers.length} of {users.length} users
      </div>

      <BulkNotificationDialog
        open={notificationDialogOpen}
        onOpenChange={setNotificationDialogOpen}
        userIds={Array.from(selectedUsers)}
      />

      {selectedUser && (
        <>
          <RoleManagementDialog
            open={roleDialogOpen}
            onOpenChange={setRoleDialogOpen}
            user={selectedUser}
            onSuccess={onUserUpdate}
          />
          <PasswordResetDialog
            open={passwordDialogOpen}
            onOpenChange={setPasswordDialogOpen}
            user={selectedUser}
            onSuccess={onUserUpdate}
          />
          <Dialog open={activityDialogOpen} onOpenChange={setActivityDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Activity Log - {selectedUser.full_name}</DialogTitle>
              </DialogHeader>
              <UserActivityLog userId={selectedUser.id} />
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

