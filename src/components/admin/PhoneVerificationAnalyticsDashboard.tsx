import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PhoneVerificationTrendsChart } from './PhoneVerificationTrendsChart';
import { CountryCodeAnalytics } from './CountryCodeAnalytics';
import { VerificationTimeAnalytics } from './VerificationTimeAnalytics';
import { ErrorTypeAnalytics } from './ErrorTypeAnalytics';
import { DropOffAnalytics } from './DropOffAnalytics';
import { TimeOfDayAnalytics } from './TimeOfDayAnalytics';
import { PhoneVerificationStats } from './PhoneVerificationStats';

export function PhoneVerificationAnalyticsDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Phone Verification Analytics</h2>
        <p className="text-muted-foreground">
          Comprehensive insights into phone verification performance and user behavior
        </p>
      </div>

      <PhoneVerificationStats />

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
          <TabsTrigger value="timing">Timing</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="dropoff">Drop-off</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <PhoneVerificationTrendsChart />
          <TimeOfDayAnalytics />
        </TabsContent>

        <TabsContent value="geography" className="space-y-4">
          <CountryCodeAnalytics />
        </TabsContent>

        <TabsContent value="timing" className="space-y-4">
          <VerificationTimeAnalytics />
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <ErrorTypeAnalytics />
        </TabsContent>

        <TabsContent value="dropoff" className="space-y-4">
          <DropOffAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}
