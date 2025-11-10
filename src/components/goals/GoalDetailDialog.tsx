import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { EditGoalSection } from './EditGoalSection';
import { MilestonesSection } from './MilestonesSection';
import { AccountabilityPartnersSection } from './AccountabilityPartnersSection';
import { ProgressHistoryTimeline } from './ProgressHistoryTimeline';
import { AddProgressUpdate } from './AddProgressUpdate';
import { RemindersSection } from './RemindersSection';
import { GoalProgressBar } from './GoalProgressBar';

import { supabase } from '@/lib/supabase';
import { Archive, Trash2, Bell } from 'lucide-react';

interface GoalDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalId: string | null;
  onUpdate: () => void;
}

export function GoalDetailDialog({ open, onOpenChange, goalId, onUpdate }: GoalDetailDialogProps) {
  const [goal, setGoal] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (goalId && open) {
      fetchGoal();
    }
  }, [goalId, open]);

  const fetchGoal = async () => {
    if (!goalId) return;
    const { data } = await supabase.from('goals').select('*').eq('id', goalId).single();
    setGoal(data);
  };

  const handleArchive = async () => {
    setLoading(true);
    await supabase.from('goals').update({ status: 'archived' }).eq('id', goalId);
    onUpdate();
    onOpenChange(false);
    setLoading(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    await supabase.from('goals').delete().eq('id', goalId);
    onUpdate();
    onOpenChange(false);
    setShowDeleteDialog(false);
    setLoading(false);
  };

  if (!goal) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Goal Details</DialogTitle>
          </DialogHeader>
          
          <GoalProgressBar progress={goal.progress} />
          
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="milestones">Milestones</TabsTrigger>
              <TabsTrigger value="partners">Partners</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
              <TabsTrigger value="reminders">
                <Bell className="h-4 w-4 mr-1" />
                Reminders
              </TabsTrigger>
            </TabsList>

            
            <TabsContent value="details" className="space-y-4">
              <EditGoalSection goal={goal} onUpdate={fetchGoal} />
            </TabsContent>
            
            <TabsContent value="milestones">
              <MilestonesSection goalId={goal.id} onProgressUpdate={fetchGoal} />
            </TabsContent>
            
            <TabsContent value="partners">
              <AccountabilityPartnersSection goalId={goal.id} />
            </TabsContent>
            
            <TabsContent value="progress" className="space-y-6">
              <AddProgressUpdate goalId={goal.id} currentProgress={goal.progress} onUpdate={fetchGoal} />
              <ProgressHistoryTimeline goalId={goal.id} />
            </TabsContent>
            
            <TabsContent value="reminders">
              <RemindersSection goalId={goal.id} />
            </TabsContent>

          </Tabs>

          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleArchive} disabled={loading}>
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </Button>
            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)} disabled={loading}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Goal?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
