import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface ExecutionLog {
  id: string;
  configuration_id: string;
  backup_id: string | null;
  status: 'success' | 'failure' | 'skipped';
  executed_at: string;
  execution_time_ms: number;
  error_message: string | null;
  rows_backed_up: number;
  backup_configurations: { name: string };
}

export function BackupExecutionLogs() {
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, [filter]);

  const loadLogs = async () => {
    setLoading(true);
    let query = supabase
      .from('backup_execution_logs')
      .select('*, backup_configurations(name)')
      .order('executed_at', { ascending: false })
      .limit(50);

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data } = await query;
    setLogs(data || []);
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failure': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Backup Execution History</CardTitle>
            <CardDescription>View automated backup execution logs</CardDescription>
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failure">Failure</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Configuration</TableHead>
              <TableHead>Executed At</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Rows</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(log.status)}
                    <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                      {log.status}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>{log.backup_configurations?.name}</TableCell>
                <TableCell>{new Date(log.executed_at).toLocaleString()}</TableCell>
                <TableCell>{log.execution_time_ms}ms</TableCell>
                <TableCell>{log.rows_backed_up?.toLocaleString()}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {log.error_message || 'Completed successfully'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}