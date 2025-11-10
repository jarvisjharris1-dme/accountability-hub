import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PeerComparisonChartProps {
  data: Array<{ metric: string; you: number; circleAvg: number }>;
}

export function PeerComparisonChart({ data }: PeerComparisonChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Peer Comparison Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" />
            <PolarRadiusAxis />
            <Tooltip />
            <Legend />
            <Radar name="You" dataKey="you" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
            <Radar name="Circle Average" dataKey="circleAvg" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
