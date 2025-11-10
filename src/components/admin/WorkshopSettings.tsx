import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

interface WorkshopSettingsProps {
  data: any;
  onChange: (data: any) => void;
}

export function WorkshopSettings({ data, onChange }: WorkshopSettingsProps) {
  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workshop Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={data.status} onValueChange={(v) => updateField('status', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="release_date">Release Date (Optional)</Label>
          <Input
            id="release_date"
            type="datetime-local"
            value={data.release_date || ''}
            onChange={(e) => updateField('release_date', e.target.value)}
          />
          <p className="text-sm text-muted-foreground mt-1">
            Leave empty for immediate release
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Featured Workshop</Label>
            <p className="text-sm text-muted-foreground">
              Display on homepage
            </p>
          </div>
          <Switch
            checked={data.is_featured || false}
            onCheckedChange={(checked) => updateField('is_featured', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Require Certificate</Label>
            <p className="text-sm text-muted-foreground">
              Generate certificate on completion
            </p>
          </div>
          <Switch
            checked={data.requires_certificate !== false}
            onCheckedChange={(checked) => updateField('requires_certificate', checked)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
