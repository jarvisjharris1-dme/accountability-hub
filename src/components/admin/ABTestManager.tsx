import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { Plus } from 'lucide-react';
import { CreateABTestDialog } from './CreateABTestDialog';
import { ABTestResultsDialog } from './ABTestResultsDialog';

interface ABTest {
  id: string;
  name: string;
  status: string;
  template_a_id: string;
  template_b_id: string;
  split_percentage: number;
  started_at: string;
  ended_at: string;
}

export function ABTestManager() {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadABTests();
  }, []);

  const loadABTests = async () => {
    try {
      const { data, error } = await supabase
        .from('email_ab_tests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTests(data || []);
    } catch (error) {
      console.error('Error loading A/B tests:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>A/B Tests</CardTitle>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New A/B Test
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tests.map((test) => (
              <div key={test.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{test.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Split: {test.split_percentage}% / {100 - test.split_percentage}%
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={test.status === 'running' ? 'default' : 'secondary'}>
                    {test.status}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => setSelectedTest(test)}>
                    View Results
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <CreateABTestDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
        onSuccess={loadABTests}
      />

      {selectedTest && (
        <ABTestResultsDialog
          test={selectedTest}
          open={!!selectedTest}
          onOpenChange={(open) => !open && setSelectedTest(null)}
        />
      )}
    </>
  );
}
