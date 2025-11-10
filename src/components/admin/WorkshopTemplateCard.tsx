import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Copy, Star } from 'lucide-react';

interface WorkshopTemplateCardProps {
  template: {
    id: string;
    name: string;
    description: string;
    category: string;
    thumbnail_url?: string;
    is_featured: boolean;
  };
  onPreview: (id: string) => void;
  onUseTemplate: (id: string) => void;
}

export function WorkshopTemplateCard({ template, onPreview, onUseTemplate }: WorkshopTemplateCardProps) {
  const categoryColors: Record<string, string> = {
    leadership: 'bg-purple-100 text-purple-800',
    communication: 'bg-blue-100 text-blue-800',
    wellness: 'bg-green-100 text-green-800',
    'personal-growth': 'bg-orange-100 text-orange-800',
    relationships: 'bg-pink-100 text-pink-800',
    other: 'bg-gray-100 text-gray-800',
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {template.thumbnail_url && (
        <img src={template.thumbnail_url} alt={template.name} className="w-full h-40 object-cover" />
      )}
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{template.name}</CardTitle>
          {template.is_featured && <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />}
        </div>
        <CardDescription className="line-clamp-2">{template.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <Badge className={categoryColors[template.category]}>{template.category}</Badge>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onPreview(template.id)}>
              <Eye className="h-4 w-4 mr-1" /> Preview
            </Button>
            <Button size="sm" onClick={() => onUseTemplate(template.id)}>
              <Copy className="h-4 w-4 mr-1" /> Use
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
