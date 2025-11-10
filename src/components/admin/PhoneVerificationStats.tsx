import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Phone, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { ManualPhoneVerifyDialog } from './ManualPhoneVerifyDialog';

interface PhoneStats {
  totalUsers: number;
  verifiedPhones: number;
  pendingVerification: number;
  failedAttempts: number;
  verificationRate: number;
}

interface UserPhoneStatus {
  id: string;
  email: string;
  phone_number: string | null;
  phone_verified: boolean;
  created_at: string;
}

export function PhoneVerificationStats() {
  const [stats, setStats] = useState<PhoneStats | null>(null);
  const [users, setUsers] = useState<UserPhoneStatus[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserPhoneStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    const { data: profiles } = await supabase.from('profiles').select('id, email, phone_number, phone_verified, created_at');
    
    if (profiles) {
      const totalUsers = profiles.length;
      const verifiedPhones = profiles.filter(p => p.phone_verified).length;
      const pendingVerification = profiles.filter(p => p.phone_number && !p.phone_verified).length;
      
      const { count: failedAttempts } = await supabase
        .from('phone_verifications')
        .select('*', { count: 'exact', head: true })
        .eq('verified', false);

      setStats({
        totalUsers,
        verifiedPhones,
        pendingVerification,
        failedAttempts: failedAttempts || 0,
        verificationRate: totalUsers > 0 ? (verifiedPhones / totalUsers) * 100 : 0
      });
      setUsers(profiles);
    }
    setLoading(false);
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-5 mb-6">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total Users</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.totalUsers || 0}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Verified Phones</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{stats?.verifiedPhones || 0}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Pending</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-yellow-600">{stats?.pendingVerification || 0}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Failed Attempts</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{stats?.failedAttempts || 0}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Verification Rate</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.verificationRate.toFixed(1) || 0}%</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>User Phone Verification Status</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone_number || 'Not provided'}</TableCell>
                  <TableCell>
                    {user.phone_verified ? (
                      <Badge className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>
                    ) : user.phone_number ? (
                      <Badge variant="outline" className="text-yellow-600"><AlertCircle className="w-3 h-3 mr-1" />Pending</Badge>
                    ) : (
                      <Badge variant="outline"><XCircle className="w-3 h-3 mr-1" />No Phone</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.phone_number && (
                      <Button size="sm" variant="outline" onClick={() => setSelectedUser(user)}><Phone className="w-3 h-3 mr-1" />Manage</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedUser && (
        <ManualPhoneVerifyDialog user={selectedUser} open={!!selectedUser} onClose={() => { setSelectedUser(null); fetchStats(); }} />
      )}
    </>
  );
}
