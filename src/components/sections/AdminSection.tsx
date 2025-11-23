import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  MessageSquare, 
  FileText, 
  TrendingUp,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';

interface AppStats {
  totalUsers: number;
  activeUsers: number;
  totalMessages: number;
  totalJournals: number;
  newUsersThisMonth: number;
}

interface WorkshopContent {
  id: string;
  title: string;
  description: string;
  content: string;
  stage: string;
  created_at: string;
}

export function AdminSection() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AppStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalMessages: 0,
    totalJournals: 0,
    newUsersThisMonth: 0
  });
  const [workshops, setWorkshops] = useState<WorkshopContent[]>([]);
  const [editingWorkshop, setEditingWorkshop] = useState<WorkshopContent | null>(null);
  const [showAddWorkshop, setShowAddWorkshop] = useState(false);

  // Form state for workshop
  const [workshopForm, setWorkshopForm] = useState({
    title: '',
    description: '',
    content: '',
    stage: 'awareness'
  });

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      loadStats();
      loadWorkshops();
    }
  }, [isAdmin]);

  const checkAdminStatus = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setIsAdmin(data?.is_admin || false);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Get total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get active users (logged in within last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: activeUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', thirtyDaysAgo.toISOString());

      // Get new users this month
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);

      const { count: newUsersThisMonth } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', firstDayOfMonth.toISOString());

      // Get total messages
      const { count: totalMessages } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true });

      // Get total journals
      const { count: totalJournals } = await supabase
        .from('journal_entries')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalMessages: totalMessages || 0,
        totalJournals: totalJournals || 0,
        newUsersThisMonth: newUsersThisMonth || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadWorkshops = async () => {
    try {
      const { data, error } = await supabase
        .from('workshop_content')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorkshops(data || []);
    } catch (error) {
      console.error('Error loading workshops:', error);
    }
  };

  const handleSaveWorkshop = async () => {
    if (!workshopForm.title.trim()) {
      alert('Please enter a title');
      return;
    }

    try {
      if (editingWorkshop) {
        // Update existing
        const { error } = await supabase
          .from('workshop_content')
          .update({
            title: workshopForm.title,
            description: workshopForm.description,
            content: workshopForm.content,
            stage: workshopForm.stage
          })
          .eq('id', editingWorkshop.id);

        if (error) throw error;
        alert('Workshop updated successfully!');
      } else {
        // Create new
        const { error } = await supabase
          .from('workshop_content')
          .insert({
            title: workshopForm.title,
            description: workshopForm.description,
            content: workshopForm.content,
            stage: workshopForm.stage
          });

        if (error) throw error;
        alert('Workshop added successfully!');
      }

      // Reset form
      setWorkshopForm({ title: '', description: '', content: '', stage: 'awareness' });
      setEditingWorkshop(null);
      setShowAddWorkshop(false);
      loadWorkshops();
    } catch (error: any) {
      console.error('Error saving workshop:', error);
      alert('Error saving workshop: ' + error.message);
    }
  };

  const handleEditWorkshop = (workshop: WorkshopContent) => {
    setEditingWorkshop(workshop);
    setWorkshopForm({
      title: workshop.title,
      description: workshop.description,
      content: workshop.content,
      stage: workshop.stage
    });
    setShowAddWorkshop(true);
  };

  const handleDeleteWorkshop = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workshop?')) return;

    try {
      const { error } = await supabase
        .from('workshop_content')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('Workshop deleted successfully!');
      loadWorkshops();
    } catch (error: any) {
      console.error('Error deleting workshop:', error);
      alert('Error deleting workshop: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a2332] mx-auto mb-4"></div>
          <p className="text-gray-600">Checking access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600">You do not have administrator privileges.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a2332] to-[#2d3e50] rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-300">Manage your Discovering Me platform</p>
      </div>

      <Tabs defaultValue="stats" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="stats">Platform Stats</TabsTrigger>
          <TabsTrigger value="workshops">Workshop Content</TabsTrigger>
        </TabsList>

        {/* Stats Tab */}
        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Total Users */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-[#1a2332]">{stats.totalUsers}</p>
                </div>
                <Users className="w-12 h-12 text-blue-500" />
              </div>
            </Card>

            {/* Active Users */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Users (30 days)</p>
                  <p className="text-3xl font-bold text-[#1a2332]">{stats.activeUsers}</p>
                </div>
                <TrendingUp className="w-12 h-12 text-green-500" />
              </div>
            </Card>

            {/* New Users This Month */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">New This Month</p>
                  <p className="text-3xl font-bold text-[#1a2332]">{stats.newUsersThisMonth}</p>
                </div>
                <Users className="w-12 h-12 text-purple-500" />
              </div>
            </Card>

            {/* Total Messages */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Messages</p>
                  <p className="text-3xl font-bold text-[#1a2332]">{stats.totalMessages}</p>
                </div>
                <MessageSquare className="w-12 h-12 text-blue-500" />
              </div>
            </Card>

            {/* Total Journals */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Journals</p>
                  <p className="text-3xl font-bold text-[#1a2332]">{stats.totalJournals}</p>
                </div>
                <FileText className="w-12 h-12 text-orange-500" />
              </div>
            </Card>

            {/* Engagement Rate */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Engagement Rate</p>
                  <p className="text-3xl font-bold text-[#1a2332]">
                    {stats.totalUsers > 0 
                      ? Math.round((stats.activeUsers / stats.totalUsers) * 100) 
                      : 0}%
                  </p>
                </div>
                <TrendingUp className="w-12 h-12 text-green-500" />
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Workshop Content Tab */}
        <TabsContent value="workshops" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-[#1a2332]">Workshop Content</h2>
            <Button 
              onClick={() => {
                setShowAddWorkshop(true);
                setEditingWorkshop(null);
                setWorkshopForm({ title: '', description: '', content: '', stage: 'awareness' });
              }}
              className="bg-[#1a2332] hover:bg-[#2d3e50]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Workshop
            </Button>
          </div>

          {/* Add/Edit Workshop Form */}
          {showAddWorkshop && (
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">
                {editingWorkshop ? 'Edit Workshop' : 'Add New Workshop'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <Input
                    value={workshopForm.title}
                    onChange={(e) => setWorkshopForm({ ...workshopForm, title: e.target.value })}
                    placeholder="Workshop title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stage</label>
                  <select
                    value={workshopForm.stage}
                    onChange={(e) => setWorkshopForm({ ...workshopForm, stage: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="awareness">Awareness</option>
                    <option value="acceptance">Acceptance</option>
                    <option value="accountability">Accountability</option>
                    <option value="action">Action</option>
                    <option value="achievement">Achievement</option>
                    <option value="advocacy">Advocacy</option>
                    <option value="abundance">Abundance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Textarea
                    value={workshopForm.description}
                    onChange={(e) => setWorkshopForm({ ...workshopForm, description: e.target.value })}
                    placeholder="Brief description"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Content</label>
                  <Textarea
                    value={workshopForm.content}
                    onChange={(e) => setWorkshopForm({ ...workshopForm, content: e.target.value })}
                    placeholder="Full workshop content (markdown supported)"
                    rows={10}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveWorkshop} className="bg-[#1a2332] hover:bg-[#2d3e50]">
                    {editingWorkshop ? 'Update' : 'Save'} Workshop
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowAddWorkshop(false);
                      setEditingWorkshop(null);
                      setWorkshopForm({ title: '', description: '', content: '', stage: 'awareness' });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Workshop List */}
          <div className="grid gap-4">
            {workshops.map((workshop) => (
              <Card key={workshop.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold">{workshop.title}</h3>
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        {workshop.stage}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{workshop.description}</p>
                    <p className="text-sm text-gray-500">
                      Created: {new Date(workshop.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditWorkshop(workshop)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteWorkshop(workshop.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
