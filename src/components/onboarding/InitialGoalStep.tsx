import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface InitialGoalStepProps {
  onComplete: (goal: { title: string; description: string; category: string; targetDate: string }) => void;
  onSkip: () => void;
}

export function InitialGoalStep({ onComplete, onSkip }: InitialGoalStepProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [targetDate, setTargetDate] = useState('');

  const handleSubmit = () => {
    if (title && category && targetDate) {
      onComplete({ title, description, category, targetDate });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Set Your First Goal</h2>
        <p className="text-gray-600">What would you like to achieve?</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Goal Title *</Label>
          <Input
            id="title"
            placeholder="e.g., Run a 5K marathon"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="category">Category *</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="health">Health & Fitness</SelectItem>
              <SelectItem value="career">Career</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="personal">Personal Growth</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="targetDate">Target Date *</Label>
          <Input
            id="targetDate"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div>
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            placeholder="Add more details about your goal..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
      </div>

      <div className="space-y-3">
        <Button 
          onClick={handleSubmit}
          className="w-full bg-[#d4a574] hover:bg-[#c49564]"
          disabled={!title || !category || !targetDate}
        >
          Complete Setup
        </Button>
        <Button onClick={onSkip} variant="ghost" className="w-full">
          Skip for now
        </Button>
      </div>
    </div>
  );
}
