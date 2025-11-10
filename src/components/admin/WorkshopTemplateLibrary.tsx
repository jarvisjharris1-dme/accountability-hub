import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { WorkshopTemplateCard } from './WorkshopTemplateCard';
import { TemplatePreviewDialog } from './TemplatePreviewDialog';
import { CreateFromTemplateDialog } from './CreateFromTemplateDialog';
import { Search, Plus } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface WorkshopTemplateLibraryProps {
  onCreateFromTemplate: (data: any) => void;
}

export function WorkshopTemplateLibrary({ onCreateFromTemplate }: WorkshopTemplateLibraryProps) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchQuery, selectedCategory]);

  const loadTemplates = async () => {
    const { data, error } = await supabase
      .from('workshop_templates')
      .select('*')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error loading templates', variant: 'destructive' });
    } else {
      setTemplates(data || []);
    }
  };

  const filterTemplates = () => {
    let filtered = templates;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTemplates(filtered);
  };

  const handlePreview = (id: string) => {
    const template = templates.find(t => t.id === id);
    setPreviewTemplate(template);
    setPreviewOpen(true);
  };

  const handleUseTemplate = (id: string) => {
    const template = templates.find(t => t.id === id);
    setSelectedTemplate(template);
    setCreateOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="leadership">Leadership</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="wellness">Wellness</TabsTrigger>
          <TabsTrigger value="personal-growth">Personal Growth</TabsTrigger>
          <TabsTrigger value="relationships">Relationships</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <WorkshopTemplateCard
            key={template.id}
            template={template}
            onPreview={handlePreview}
            onUseTemplate={handleUseTemplate}
          />
        ))}
      </div>

      <TemplatePreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        template={previewTemplate}
        onUseTemplate={() => {
          setPreviewOpen(false);
          handleUseTemplate(previewTemplate.id);
        }}
      />

      <CreateFromTemplateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        template={selectedTemplate}
        onCreateWorkshop={onCreateFromTemplate}
      />
    </div>
  );
}
