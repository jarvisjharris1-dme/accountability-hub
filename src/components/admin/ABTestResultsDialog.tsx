import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Trophy } from 'lucide-react';

interface ABTestResultsDialogProps {
  test: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ABTestResultsDialog({ test, open, onOpenChange }: ABTestResultsDialogProps) {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) loadResults();
  }, [open, test]);

  const loadResults = async () => {
    try {
      const { data, error } = await supabase
        .from('email_sends')
        .select('*')
        .eq('email_type', 'ab_test')
        .in('ab_test_variant', ['A', 'B']);

      if (error) throw error;

      const variantA = data?.filter(d => d.ab_test_variant === 'A') || [];
      const variantB = data?.filter(d => d.ab_test_variant === 'B') || [];

      setResults({
        variantA: {
          sent: variantA.length,
          opened: variantA.filter(d => d.opened_at).length,
          clicked: variantA.filter(d => d.clicked_at).length,
          openRate: (variantA.filter(d => d.opened_at).length / variantA.length) * 100 || 0,
          clickRate: (variantA.filter(d => d.clicked_at).length / variantA.length) * 100 || 0,
        },
        variantB: {
          sent: variantB.length,
          opened: variantB.filter(d => d.opened_at).length,
          clicked: variantB.filter(d => d.clicked_at).length,
          openRate: (variantB.filter(d => d.opened_at).length / variantB.length) * 100 || 0,
          clickRate: (variantB.filter(d => d.clicked_at).length / variantB.length) * 100 || 0,
        },
      });
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!results) return null;

  const winner = results.variantA.openRate > results.variantB.openRate ? 'A' : 'B';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{test.name} - Results</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Variant A
                {winner === 'A' && <Trophy className="h-5 w-5 text-yellow-500" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Sent:</span>
                <span className="font-bold">{results.variantA.sent}</span>
              </div>
              <div className="flex justify-between">
                <span>Opened:</span>
                <span className="font-bold">{results.variantA.opened}</span>
              </div>
              <div className="flex justify-between">
                <span>Open Rate:</span>
                <Badge>{results.variantA.openRate.toFixed(1)}%</Badge>
              </div>
              <div className="flex justify-between">
                <span>Click Rate:</span>
                <Badge>{results.variantA.clickRate.toFixed(1)}%</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Variant B
                {winner === 'B' && <Trophy className="h-5 w-5 text-yellow-500" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Sent:</span>
                <span className="font-bold">{results.variantB.sent}</span>
              </div>
              <div className="flex justify-between">
                <span>Opened:</span>
                <span className="font-bold">{results.variantB.opened}</span>
              </div>
              <div className="flex justify-between">
                <span>Open Rate:</span>
                <Badge>{results.variantB.openRate.toFixed(1)}%</Badge>
              </div>
              <div className="flex justify-between">
                <span>Click Rate:</span>
                <Badge>{results.variantB.clickRate.toFixed(1)}%</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
