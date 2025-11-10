import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Mail, Eye } from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
}

interface EmailTemplateListProps {
  templates: EmailTemplate[];
  onEdit: (template: EmailTemplate) => void;
  onDelete: (id: string) => void;
  onPreview: (template: EmailTemplate) => void;
  onTest: (template: EmailTemplate) => void;
}

export function EmailTemplateList({ templates, onEdit, onDelete, onPreview, onTest }: EmailTemplateListProps) {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      welcome: 'bg-green-100 text-green-800',
      password_reset: 'bg-blue-100 text-blue-800',
      notification: 'bg-purple-100 text-purple-800',
      custom: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.custom;
  };

  return (
    <div className="space-y-4">
      {templates.map((template) => (
        <Card key={template.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold">{template.name}</h3>
                <Badge className={getCategoryColor(template.category)}>
                  {template.category}
                </Badge>
                {!template.is_active && <Badge variant="outline">Inactive</Badge>}
              </div>
              <p className="text-sm text-muted-foreground mb-2">{template.subject}</p>
              <div className="flex gap-2 flex-wrap">
                {template.variables.map((v) => (
                  <Badge key={v} variant="secondary" className="text-xs">
                    {`{{${v}}}`}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => onPreview(template)}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onTest(template)}>
                <Mail className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onEdit(template)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onDelete(template.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
