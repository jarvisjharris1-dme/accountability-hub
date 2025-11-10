import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface WorkshopOverviewProps {
  data: any;
  onChange: (data: any) => void;
}

export function WorkshopOverview({ data, onChange }: WorkshopOverviewProps) {
  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workshop Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="title">Workshop Title</Label>
          <Input
            id="title"
            value={data.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Enter workshop title"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={data.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Describe what participants will learn"
            rows={4}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="difficulty">Difficulty Level</Label>
            <Select value={data.difficulty_level} onValueChange={(v) => updateField('difficulty_level', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="duration">Estimated Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              value={data.estimated_duration || ''}
              onChange={(e) => updateField('estimated_duration', parseInt(e.target.value))}
              placeholder="60"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
