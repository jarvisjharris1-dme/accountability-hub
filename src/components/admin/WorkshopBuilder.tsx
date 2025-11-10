import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { WorkshopOverview } from './WorkshopOverview';
import { WorkshopModules } from './WorkshopModules';
import { WorkshopSettings } from './WorkshopSettings';
import { WorkshopPreview } from './WorkshopPreview';

interface WorkshopBuilderProps {
  workshopId?: string;
  onBack: () => void;
  onSave: (data: any) => Promise<void>;
}

export function WorkshopBuilder({ workshopId, onBack, onSave }: WorkshopBuilderProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [workshopData, setWorkshopData] = useState<any>({
    title: '',
    description: '',
    status: 'draft',
    difficulty_level: 'beginner',
    modules: []
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(workshopData);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Workshops
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Saving...' : 'Save Workshop'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <WorkshopOverview data={workshopData} onChange={setWorkshopData} />
        </TabsContent>

        <TabsContent value="modules">
          <WorkshopModules data={workshopData} onChange={setWorkshopData} />
        </TabsContent>

        <TabsContent value="settings">
          <WorkshopSettings data={workshopData} onChange={setWorkshopData} />
        </TabsContent>

        <TabsContent value="preview">
          <WorkshopPreview data={workshopData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
