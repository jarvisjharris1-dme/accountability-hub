import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserManagementTable } from '@/components/admin/UserManagementTable';
import { CircleManagementTable } from '@/components/admin/CircleManagementTable';
import { WorkshopMonitoring } from '@/components/admin/WorkshopMonitoring';
import { ContentModeration } from '@/components/admin/ContentModeration';
import { EmailTemplateList } from '@/components/admin/EmailTemplateList';
import { EmailTemplateEditor } from '@/components/admin/EmailTemplateEditor';
import { SendTestEmailDialog } from '@/components/admin/SendTestEmailDialog';
import { CampaignCalendar } from '@/components/admin/CampaignCalendar';
import { CreateCampaignDialog } from '@/components/admin/CreateCampaignDialog';
import { CampaignList } from '@/components/admin/CampaignList';
import { WorkshopBuilder } from '@/components/admin/WorkshopBuilder';
import { WorkshopListTable } from '@/components/admin/WorkshopListTable';
import { WorkshopTemplateLibrary } from '@/components/admin/WorkshopTemplateLibrary';
import { PasswordResetPreviewDialog } from '@/components/admin/PasswordResetPreviewDialog';
import { EmailAnalyticsOverview } from '@/components/admin/EmailAnalyticsOverview';
import { EmailPerformanceChart } from '@/components/admin/EmailPerformanceChart';
import { TopTemplatesTable } from '@/components/admin/TopTemplatesTable';
import { ABTestManager } from '@/components/admin/ABTestManager';
import { BackupManagement } from '@/components/admin/BackupManagement';
import { EmailVerificationStats } from '@/components/admin/EmailVerificationStats';
import { PhoneVerificationStats } from '@/components/admin/PhoneVerificationStats';
import { PhoneVerificationAnalyticsDashboard } from '@/components/admin/PhoneVerificationAnalyticsDashboard';
import { SMSTemplateEditor } from '@/components/admin/SMSTemplateEditor';
import { IncompleteProfilesTable } from '@/components/admin/IncompleteProfilesTable';
import { SignupHealthDashboard } from '@/components/admin/SignupHealthDashboard';








import { supabase } from '@/lib/supabase';
import { Users, Shield, BookOpen, Flag, TrendingUp, Mail, Calendar, Plus, Wrench, BarChart3, Database, Phone } from 'lucide-react';


import { Button } from '@/components/ui/button';
import { toast } from 'sonner';




export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [circles, setCircles] = useState([]);
  const [workshopStats, setWorkshopStats] = useState([]);
  const [flaggedContent, setFlaggedContent] = useState([]);
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [scheduledEmails, setScheduledEmails] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0, totalCircles: 0, pendingFlags: 0 });
  const [editorOpen, setEditorOpen] = useState(false);
  const [testEmailOpen, setTestEmailOpen] = useState(false);
  const [campaignDialogOpen, setCampaignDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [selectedWorkshop, setSelectedWorkshop] = useState<any>(null);
  const [workshopBuilderOpen, setWorkshopBuilderOpen] = useState(false);
  const [passwordResetPreviewOpen, setPasswordResetPreviewOpen] = useState(false);





  const loadData = async () => {
    try {
      const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();
      
      const [usersRes, circlesRes, workshopsResData, flagsRes, templatesRes, campaignsRes, scheduledRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('circle_members').select('circle_id, profiles!circle_members_user_id_fkey(full_name)'),
        supabase.from('workshops').select('*, workshop_user_progress(user_id)').order('created_at', { ascending: false }),
        supabase.from('flagged_content').select('*, profiles!flagged_content_reported_by_fkey(full_name)').eq('status', 'pending'),
        supabase.from('email_templates').select('*').order('created_at', { ascending: false }),
        supabase.from('email_campaigns').select('*').order('created_at', { ascending: false }),
        supabase.from('scheduled_emails').select('*').order('scheduled_for', { ascending: true })
      ]);



      // Merge profile data with auth email verification status
      const usersWithVerification = usersRes.data?.map(profile => {
        const authUser = authUsers?.find(au => au.id === profile.id);
        return {
          ...profile,
          email_verified: authUser?.email_confirmed_at ? true : false
        };
      }) || [];

      setUsers(usersWithVerification);
      setWorkshops(workshopsResData.data || []);
      setEmailTemplates(templatesRes.data || []);
      setCampaigns(campaignsRes.data || []);
      setScheduledEmails(scheduledRes.data || []);
      
      const activeUsers = usersWithVerification.filter(u => 
        u.last_login_at && new Date(u.last_login_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length;

      setStats({
        totalUsers: usersWithVerification.length,
        activeUsers,
        totalCircles: new Set(circlesRes.data?.map(c => c.circle_id)).size || 0,
        pendingFlags: flagsRes.data?.length || 0
      });

      if (flagsRes.data) {
        setFlaggedContent(flagsRes.data.map(f => ({
          ...f,
          reporter_name: f.profiles?.full_name || 'Unknown'
        })));
      }


    } catch (error) {
      toast.error('Failed to load admin data');
    }
  };

  const handleSaveTemplate = async (template: any) => {
    try {
      if (template.id) {
        const { error } = await supabase
          .from('email_templates')
          .update({
            name: template.name,
            subject: template.subject,
            body: template.body,
            category: template.category,
            variables: template.variables,
            updated_at: new Date().toISOString()
          })
          .eq('id', template.id);
        if (error) throw error;
        toast.success('Template updated successfully');
      } else {
        const { error } = await supabase
          .from('email_templates')
          .insert({
            name: template.name,
            subject: template.subject,
            body: template.body,
            category: template.category,
            variables: template.variables
          });
        if (error) throw error;
        toast.success('Template created successfully');
      }
      loadData();
    } catch (error: any) {
      toast.error('Failed to save template: ' + error.message);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      const { error } = await supabase.from('email_templates').delete().eq('id', id);
      if (error) throw error;
      toast.success('Template deleted successfully');
      loadData();
    } catch (error: any) {
      toast.error('Failed to delete template: ' + error.message);
    }
  };

  const handleCreateCampaign = async (campaign: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('email_campaigns').insert({
        ...campaign,
        created_by: user?.id,
        status: 'draft'
      });
      if (error) throw error;
      toast.success('Campaign created successfully');
      setCampaignDialogOpen(false);
      loadData();
    } catch (error: any) {
      toast.error('Failed to create campaign: ' + error.message);
    }
  };

  const handlePauseCampaign = async (id: string) => {
    try {
      const { error } = await supabase.from('email_campaigns').update({ status: 'paused' }).eq('id', id);
      if (error) throw error;
      toast.success('Campaign paused');
      loadData();
    } catch (error: any) {
      toast.error('Failed to pause campaign: ' + error.message);
    }
  };

  const handleResumeCampaign = async (id: string) => {
    try {
      const { error } = await supabase.from('email_campaigns').update({ status: 'active' }).eq('id', id);
      if (error) throw error;
      toast.success('Campaign resumed');
      loadData();
    } catch (error: any) {
      toast.error('Failed to resume campaign: ' + error.message);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    try {
      const { error } = await supabase.from('email_campaigns').delete().eq('id', id);
      if (error) throw error;
      toast.success('Campaign deleted');
      loadData();
    } catch (error: any) {
      toast.error('Failed to delete campaign: ' + error.message);
    }
  };

  const handleDeleteWorkshop = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workshop?')) return;
    try {
      const { error } = await supabase.from('workshops').delete().eq('id', id);
      if (error) throw error;
      toast.success('Workshop deleted successfully');
      loadData();
    } catch (error: any) {
      toast.error('Failed to delete workshop: ' + error.message);
    }
  };
  const handleSaveWorkshop = async () => {
    setWorkshopBuilderOpen(false);
    setSelectedWorkshop(null);
    loadData();
  };

  const handleCreateFromTemplate = async (workshopData: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('workshops').insert({
        ...workshopData,
        created_by: user?.id
      });
      if (error) throw error;
      toast.success('Workshop created from template successfully');
      loadData();
    } catch (error: any) {
      toast.error('Failed to create workshop: ' + error.message);
    }
  };

  // Calculate workshop stats
  const totalWorkshops = workshops.length;
  const publishedWorkshops = workshops.filter(w => w.status === 'published').length;
  const totalEnrollments = workshops.reduce((sum, w) => sum + (w.workshop_user_progress?.length || 0), 0);






  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Logo */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between">
          <img 
            src="https://d64gsuwffb70l.cloudfront.net/6906b08a650ee0590aaf4bb4_1762183406403_6827ce42.png" 
            alt="Accountable" 
            className="h-10 w-auto"
          />
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-gray-700">Admin Panel</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>


      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Active Users (7d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Total Circles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCircles}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Flag className="h-4 w-4" />
              Pending Flags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingFlags}</div>
          </CardContent>
        </Card>
      </div>


      <Tabs defaultValue="users" className="space-y-4">

        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="signup-health">Signup Health</TabsTrigger>
          <TabsTrigger value="phone-analytics">Phone Analytics</TabsTrigger>
          <TabsTrigger value="sms-templates">SMS Templates</TabsTrigger>
          <TabsTrigger value="backups">Backup & Restore</TabsTrigger>
          <TabsTrigger value="moderation">Content Moderation</TabsTrigger>
          <TabsTrigger value="workshops">Workshop Builder</TabsTrigger>
          <TabsTrigger value="templates">Workshop Templates</TabsTrigger>
          <TabsTrigger value="emails">Email Templates</TabsTrigger>
          <TabsTrigger value="analytics">Email Analytics</TabsTrigger>
        </TabsList>



        <TabsContent value="signup-health" className="space-y-4">
          <SignupHealthDashboard />
        </TabsContent>


        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Incomplete Profiles</CardTitle>
              <CardDescription>Users with signup issues requiring profile repair</CardDescription>
            </CardHeader>
            <CardContent>
              <IncompleteProfilesTable />
            </CardContent>
          </Card>

          <EmailVerificationStats />
          
          <PhoneVerificationStats />
          
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage all user accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <UserManagementTable users={users} onUserUpdate={loadData} />
            </CardContent>
          </Card>
        </TabsContent>


        <TabsContent value="phone-analytics" className="space-y-4">
          <PhoneVerificationAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="sms-templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SMS Templates</CardTitle>
              <CardDescription>Manage multi-language SMS verification templates</CardDescription>
            </CardHeader>
            <CardContent>
              <SMSTemplateEditor />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backups" className="space-y-4">
          <BackupManagement />
        </TabsContent>




        <TabsContent value="moderation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Moderation</CardTitle>
              <CardDescription>Review and resolve flagged content</CardDescription>
            </CardHeader>
            <CardContent>
              <ContentModeration flaggedItems={flaggedContent} onUpdate={loadData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workshops" className="space-y-4">
          {workshopBuilderOpen ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{selectedWorkshop ? 'Edit Workshop' : 'Create Workshop'}</CardTitle>
                  <Button variant="outline" onClick={() => { setWorkshopBuilderOpen(false); setSelectedWorkshop(null); }}>
                    Back to List
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <WorkshopBuilder workshop={selectedWorkshop} onSave={handleSaveWorkshop} />
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Total Workshops
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalWorkshops}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Published
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{publishedWorkshops}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Total Enrollments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalEnrollments}</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Workshop Management</CardTitle>
                      <CardDescription>Create and manage workshops</CardDescription>
                    </div>
                    <Button onClick={() => { setSelectedWorkshop(null); setWorkshopBuilderOpen(true); }}>
                      <Wrench className="h-4 w-4 mr-2" />
                      Create Workshop
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <WorkshopListTable
                    workshops={workshops}
                    onEdit={(workshop) => { setSelectedWorkshop(workshop); setWorkshopBuilderOpen(true); }}
                    onDelete={handleDeleteWorkshop}
                  />
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workshop Template Library</CardTitle>
              <CardDescription>Browse and use pre-built workshop templates</CardDescription>
            </CardHeader>
            <CardContent>
              <WorkshopTemplateLibrary onCreateFromTemplate={handleCreateFromTemplate} />
            </CardContent>
          </Card>
        </TabsContent>


        <TabsContent value="emails" className="space-y-4">
          <Card className="mb-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Password Reset Email Template</CardTitle>
                  <CardDescription>Preview the branded password reset email design</CardDescription>
                </div>
                <Button onClick={() => setPasswordResetPreviewOpen(true)} variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Preview Password Reset Email
                </Button>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Email Templates</CardTitle>
                  <CardDescription>Manage email templates with dynamic variables</CardDescription>
                </div>
                <Button onClick={() => { setSelectedTemplate(null); setEditorOpen(true); }}>
                  <Mail className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <EmailTemplateList
                templates={emailTemplates}
                onEdit={(template) => { setSelectedTemplate(template); setEditorOpen(true); }}
                onDelete={handleDeleteTemplate}
                onPreview={(template) => { setSelectedTemplate(template); setEditorOpen(true); }}
                onTest={(template) => { setSelectedTemplate(template); setTestEmailOpen(true); }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Email Campaigns</CardTitle>
                    <CardDescription>Schedule and manage email campaigns</CardDescription>
                  </div>
                  <Button onClick={() => setCampaignDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Campaign
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <CampaignList
                  campaigns={campaigns}
                  onPause={handlePauseCampaign}
                  onResume={handleResumeCampaign}
                  onDelete={handleDeleteCampaign}
                  onViewStats={(id) => toast.info('Campaign stats coming soon')}
                />
              </CardContent>
            </Card>

            <CampaignCalendar
              scheduledEmails={scheduledEmails}
              onEmailClick={(email) => toast.info(`Email: ${email.subject}`)}
            />
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <EmailAnalyticsOverview
            totalSent={1250}
            deliveryRate={98.5}
            openRate={32.4}
            clickRate={8.7}
            bounceRate={1.5}
          />

          <EmailPerformanceChart
            data={[
              { date: 'Oct 28', sent: 150, opened: 48, clicked: 12, bounced: 2 },
              { date: 'Oct 29', sent: 180, opened: 58, clicked: 15, bounced: 3 },
              { date: 'Oct 30', sent: 165, opened: 53, clicked: 14, bounced: 2 },
              { date: 'Oct 31', sent: 200, opened: 65, clicked: 18, bounced: 4 },
              { date: 'Nov 1', sent: 175, opened: 57, clicked: 16, bounced: 2 },
              { date: 'Nov 2', sent: 190, opened: 62, clicked: 17, bounced: 3 },
              { date: 'Nov 3', sent: 190, opened: 61, clicked: 16, bounced: 3 },
            ]}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopTemplatesTable
              templates={[
                { id: '1', name: 'Welcome Email', sent: 450, openRate: 45.2, clickRate: 12.3, conversionRate: 8.5 },
                { id: '2', name: 'Weekly Newsletter', sent: 380, openRate: 38.7, clickRate: 10.1, conversionRate: 6.2 },
                { id: '3', name: 'Goal Reminder', sent: 320, openRate: 35.4, clickRate: 9.8, conversionRate: 7.1 },
                { id: '4', name: 'Achievement Unlock', sent: 280, openRate: 42.1, clickRate: 11.5, conversionRate: 9.2 },
                { id: '5', name: 'Circle Invitation', sent: 220, openRate: 28.3, clickRate: 7.4, conversionRate: 5.8 },
              ]}
            />
            <ABTestManager />
          </div>
        </TabsContent>
      </Tabs>


      <CreateCampaignDialog
        open={campaignDialogOpen}
        onOpenChange={setCampaignDialogOpen}
        templates={emailTemplates}
        onSubmit={handleCreateCampaign}
      />

      <EmailTemplateEditor
        open={editorOpen}
        onClose={() => { setEditorOpen(false); setSelectedTemplate(null); }}
        template={selectedTemplate}
        onSave={handleSaveTemplate}
      />

      <SendTestEmailDialog
        open={testEmailOpen}
        onClose={() => { setTestEmailOpen(false); setSelectedTemplate(null); }}
        template={selectedTemplate}
      />

      <PasswordResetPreviewDialog
        open={passwordResetPreviewOpen}
        onOpenChange={setPasswordResetPreviewOpen}
      />

      </div>
    </div>
  );
}
