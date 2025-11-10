import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Pause, Trash2, BarChart3 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Campaign {
  id: string;
  name: string;
  description: string;
  trigger_type: string;
  status: string;
  total_recipients: number;
  emails_sent: number;
  emails_opened: number;
  emails_clicked: number;
  scheduled_time?: string;
  created_at: string;
}

interface CampaignListProps {
  campaigns: Campaign[];
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onDelete: (id: string) => void;
  onViewStats: (id: string) => void;
}

export function CampaignList({ campaigns, onPause, onResume, onDelete, onViewStats }: CampaignListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'paused': return 'secondary';
      case 'completed': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-4">
      {campaigns.map(campaign => {
        const openRate = campaign.emails_sent > 0 
          ? (campaign.emails_opened / campaign.emails_sent) * 100 
          : 0;
        const clickRate = campaign.emails_sent > 0 
          ? (campaign.emails_clicked / campaign.emails_sent) * 100 
          : 0;

        return (
          <Card key={campaign.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{campaign.name}</h3>
                    <Badge variant={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                    <Badge variant="outline">{campaign.trigger_type}</Badge>
                  </div>
                  {campaign.description && (
                    <p className="text-sm text-muted-foreground">{campaign.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {campaign.status === 'active' && (
                    <Button size="sm" variant="outline" onClick={() => onPause(campaign.id)}>
                      <Pause className="h-4 w-4" />
                    </Button>
                  )}
                  {campaign.status === 'paused' && (
                    <Button size="sm" variant="outline" onClick={() => onResume(campaign.id)}>
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => onViewStats(campaign.id)}>
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onDelete(campaign.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">Recipients</p>
                  <p className="text-2xl font-bold">{campaign.total_recipients}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Sent</p>
                  <p className="text-2xl font-bold">{campaign.emails_sent}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Open Rate</p>
                  <p className="text-2xl font-bold">{openRate.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Click Rate</p>
                  <p className="text-2xl font-bold">{clickRate.toFixed(1)}%</p>
                </div>
              </div>

              {campaign.total_recipients > 0 && (
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Progress</span>
                    <span>{campaign.emails_sent} / {campaign.total_recipients}</span>
                  </div>
                  <Progress value={(campaign.emails_sent / campaign.total_recipients) * 100} />
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
