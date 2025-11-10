import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface HeatmapData {
  day: string;
  hour: number;
  value: number;
}

interface CircleActivityHeatmapProps {
  data: HeatmapData[];
}

export function CircleActivityHeatmap({ data }: CircleActivityHeatmapProps) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getColor = (value: number) => {
    if (value === 0) return 'bg-gray-100';
    if (value < 5) return 'bg-purple-200';
    if (value < 10) return 'bg-purple-400';
    if (value < 15) return 'bg-purple-600';
    return 'bg-purple-800';
  };

  const getValue = (day: string, hour: number) => {
    const item = data.find(d => d.day === day && d.hour === hour);
    return item?.value || 0;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Circle Activity Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <div className="flex gap-1">
              <div className="flex flex-col gap-1 pt-6">
                {days.map(day => (
                  <div key={day} className="h-4 text-xs flex items-center">{day}</div>
                ))}
              </div>
              <div className="flex gap-1">
                {hours.map(hour => (
                  <div key={hour} className="flex flex-col gap-1">
                    <div className="h-6 text-xs text-center">{hour}</div>
                    {days.map(day => (
                      <div
                        key={`${day}-${hour}`}
                        className={`w-4 h-4 rounded-sm ${getColor(getValue(day, hour))}`}
                        title={`${day} ${hour}:00 - ${getValue(day, hour)} activities`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
