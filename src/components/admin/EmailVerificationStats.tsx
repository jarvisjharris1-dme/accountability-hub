import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { CheckCircle, XCircle, Clock, Mail } from 'lucide-react';

interface VerificationStats {
  total: number;
  verified: number;
  pending: number;
  failed: number;
  verificationRate: number;
}

export const EmailVerificationStats: React.FC = () => {
  const [stats, setStats] = useState<VerificationStats>({
    total: 0,
    verified: 0,
    pending: 0,
    failed: 0,
    verificationRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data: logs, error } = await supabase
        .from('email_verification_logs')
        .select('status');

      if (error) throw error;

      const total = logs?.length || 0;
      const verified = logs?.filter(l => l.status === 'verified').length || 0;
      const pending = logs?.filter(l => l.status === 'pending').length || 0;
      const failed = logs?.filter(l => l.status === 'failed').length || 0;
      const verificationRate = total > 0 ? (verified / total) * 100 : 0;

      setStats({ total, verified, pending, failed, verificationRate });
    } catch (error) {
      console.error('Error loading verification stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Loading stats...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Verification Stats
        </CardTitle>
        <CardDescription>Overview of user email verification status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-500">Total Users</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-2xl font-bold text-green-600">{stats.verified}</span>
            </div>
            <div className="text-xs text-gray-500">Verified</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Clock className="h-4 w-4 text-amber-600" />
              <span className="text-2xl font-bold text-amber-600">{stats.pending}</span>
            </div>
            <div className="text-xs text-gray-500">Pending</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-2xl font-bold text-red-600">{stats.failed}</span>
            </div>
            <div className="text-xs text-gray-500">Failed</div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Verification Rate</span>
            <Badge variant={stats.verificationRate > 70 ? 'default' : 'secondary'}>
              {stats.verificationRate.toFixed(1)}%
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
