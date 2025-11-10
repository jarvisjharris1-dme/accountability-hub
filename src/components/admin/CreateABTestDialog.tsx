import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface CreateABTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateABTestDialog({ open, onOpenChange, onSuccess }: CreateABTestDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [templateAId, setTemplateAId] = useState('');
  const [templateBId, setTemplateBId] = useState('');
  const [splitPercentage, setSplitPercentage] = useState([50]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) loadTemplates();
  }, [open]);

  const loadTemplates = async () => {
    const { data } = await supabase.from('email_templates').select('*');
    setTemplates(data || []);
  };

  const handleCreate = async () => {
    if (!name || !templateAId || !templateBId) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('email_ab_tests').insert({
        name,
        description,
        template_a_id: templateAId,
        template_b_id: templateBId,
        split_percentage: splitPercentage[0],
        status: 'draft',
      });

      if (error) throw error;
      toast.success('A/B test created successfully');
      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to create A/B test');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setTemplateAId('');
    setTemplateBId('');
    setSplitPercentage([50]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create A/B Test</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Test Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Template A</Label>
              <Select value={templateAId} onValueChange={setTemplateAId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Template B</Label>
              <Select value={templateBId} onValueChange={setTemplateBId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Traffic Split (A: {splitPercentage[0]}% / B: {100 - splitPercentage[0]}%)</Label>
            <Slider value={splitPercentage} onValueChange={setSplitPercentage} max={100} step={5} />
          </div>
          <Button onClick={handleCreate} disabled={loading} className="w-full">
            Create A/B Test
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
