import { Monitor, Smartphone, MapPin, Clock, LogOut } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SessionCardProps {
  session: {
    id: string;
    device_type: string;
    browser: string;
    os: string;
    location_city: string;
    location_country: string;
    last_active: string;
    is_current: boolean;
  };
  onRevoke: (sessionId: string) => void;
  isRevoking: boolean;
}

export function SessionCard({ session, onRevoke, isRevoking }: SessionCardProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              {session.device_type === 'Mobile' ? (
                <Smartphone className="h-6 w-6 text-primary" />
              ) : (
                <Monitor className="h-6 w-6 text-primary" />
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{session.browser} on {session.os}</h3>
                {session.is_current && (
                  <Badge variant="secondary">Current Session</Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{session.location_city}, {session.location_country}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Last active: {formatDate(session.last_active)}</span>
                </div>
              </div>
            </div>
          </div>
          {!session.is_current && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRevoke(session.id)}
              disabled={isRevoking}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log Out
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}