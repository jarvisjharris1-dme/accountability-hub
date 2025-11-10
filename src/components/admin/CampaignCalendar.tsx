import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mail, Clock } from 'lucide-react';

interface ScheduledEmail {
  id: string;
  subject: string;
  recipient_email: string;
  scheduled_for: string;
  status: string;
  campaign_id?: string;
}

interface CampaignCalendarProps {
  scheduledEmails: ScheduledEmail[];
  onEmailClick: (email: ScheduledEmail) => void;
}

export function CampaignCalendar({ scheduledEmails, onEmailClick }: CampaignCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const emailsOnDate = scheduledEmails.filter(email => {
    const emailDate = new Date(email.scheduled_for);
    return selectedDate && 
      emailDate.toDateString() === selectedDate.toDateString();
  });

  const datesWithEmails = scheduledEmails.map(email => 
    new Date(email.scheduled_for).toDateString()
  );

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Schedule Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            modifiers={{
              hasEmails: (date) => datesWithEmails.includes(date.toDateString())
            }}
            modifiersStyles={{
              hasEmails: { fontWeight: 'bold', backgroundColor: 'hsl(var(--primary) / 0.1)' }
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Scheduled for {selectedDate?.toLocaleDateString()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[350px]">
            {emailsOnDate.length === 0 ? (
              <p className="text-sm text-muted-foreground">No emails scheduled for this date</p>
            ) : (
              <div className="space-y-3">
                {emailsOnDate.map(email => (
                  <div
                    key={email.id}
                    onClick={() => onEmailClick(email)}
                    className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1">
                        <Mail className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{email.subject}</p>
                          <p className="text-xs text-muted-foreground truncate">{email.recipient_email}</p>
                        </div>
                      </div>
                      <Badge variant={email.status === 'sent' ? 'default' : 'secondary'}>
                        {email.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(email.scheduled_for).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
