import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, GripVertical, Trash2, Edit } from 'lucide-react';
import { ModuleEditor } from './ModuleEditor';

interface WorkshopModulesProps {
  data: any;
  onChange: (data: any) => void;
}

export function WorkshopModules({ data, onChange }: WorkshopModulesProps) {
  const [editingModule, setEditingModule] = useState<any>(null);
  const [showEditor, setShowEditor] = useState(false);

  const addModule = () => {
    setEditingModule({
      id: Date.now().toString(),
      title: '',
      description: '',
      order_index: data.modules?.length || 0,
      content: []
    });
    setShowEditor(true);
  };

  const saveModule = (module: any) => {
    const modules = data.modules || [];
    const index = modules.findIndex((m: any) => m.id === module.id);
    
    if (index >= 0) {
      modules[index] = module;
    } else {
      modules.push(module);
    }
    
    onChange({ ...data, modules });
    setShowEditor(false);
    setEditingModule(null);
  };

  const deleteModule = (id: string) => {
    const modules = (data.modules || []).filter((m: any) => m.id !== id);
    onChange({ ...data, modules });
  };

  if (showEditor) {
    return (
      <ModuleEditor
        module={editingModule}
        onSave={saveModule}
        onCancel={() => {
          setShowEditor(false);
          setEditingModule(null);
        }}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Workshop Modules</CardTitle>
          <Button onClick={addModule}>
            <Plus className="mr-2 h-4 w-4" />
            Add Module
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!data.modules?.length ? (
          <p className="text-center text-muted-foreground py-8">
            No modules yet. Click "Add Module" to get started.
          </p>
        ) : (
          <div className="space-y-2">
            {data.modules.map((module: any, index: number) => (
              <div key={module.id} className="flex items-center gap-2 p-4 border rounded-lg">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <h4 className="font-medium">{module.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {module.content?.length || 0} content items
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => {
                  setEditingModule(module);
                  setShowEditor(true);
                }}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => deleteModule(module.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
