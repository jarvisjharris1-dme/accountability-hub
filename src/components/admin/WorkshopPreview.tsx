import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Clock, BookOpen, Award } from 'lucide-react';

interface WorkshopPreviewProps {
  data: any;
}

export function WorkshopPreview({ data }: WorkshopPreviewProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{data.title || 'Untitled Workshop'}</CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline">{data.difficulty_level}</Badge>
                <Badge variant="outline">{data.status}</Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{data.description || 'No description provided'}</p>
          
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{data.estimated_duration || 0} minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{data.modules?.length || 0} modules</span>
            </div>
            {data.requires_certificate && (
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Certificate included</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Modules</CardTitle>
        </CardHeader>
        <CardContent>
          {!data.modules?.length ? (
            <p className="text-center text-muted-foreground py-4">No modules added yet</p>
          ) : (
            <Accordion type="single" collapsible>
              {data.modules.map((module: any, index: number) => (
                <AccordionItem key={module.id} value={module.id}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{index + 1}. {module.title}</span>
                      <Badge variant="secondary">{module.content?.length || 0} items</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pl-4">
                      {module.content?.map((item: any, idx: number) => (
                        <div key={item.id} className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">{idx + 1}.</span>
                          <span>{item.title}</span>
                          <Badge variant="outline" className="text-xs">{item.content_type}</Badge>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
