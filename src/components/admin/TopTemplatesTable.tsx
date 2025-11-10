import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface TemplatePerformance {
  id: string;
  name: string;
  sent: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
}

interface TopTemplatesTableProps {
  templates: TemplatePerformance[];
}

export function TopTemplatesTable({ templates }: TopTemplatesTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Performing Templates</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Template Name</TableHead>
              <TableHead className="text-right">Sent</TableHead>
              <TableHead className="text-right">Open Rate</TableHead>
              <TableHead className="text-right">Click Rate</TableHead>
              <TableHead className="text-right">Performance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map((template) => (
              <TableRow key={template.id}>
                <TableCell className="font-medium">{template.name}</TableCell>
                <TableCell className="text-right">{template.sent.toLocaleString()}</TableCell>
                <TableCell className="text-right">{template.openRate.toFixed(1)}%</TableCell>
                <TableCell className="text-right">{template.clickRate.toFixed(1)}%</TableCell>
                <TableCell className="text-right">
                  <Badge variant={template.openRate > 25 ? 'default' : 'secondary'}>
                    {template.openRate > 25 ? 'Excellent' : 'Good'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
