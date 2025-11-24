import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, 
  MessageSquare, 
  FileText, 
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Upload,
  Link as LinkIcon,
  Video,
  Music,
  FileText as TextIcon
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
  content_type: 'text' | 'article' | 'video' | 'audio';
  article_url?: string;
  video_url?: string;
  audio_url?: string;
  media_file_path?: string;
  created_at: string;
}

export function AdminSection() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');
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
  const [uploading, setUploading] = useState(false);

  // Form state for workshop
  const [workshopForm, setWorkshopForm] = useState({
    title: '',
    description: '',
    content: '',
    stage: 'awareness',
    content_type: 'text' as 'text' | 'article' | 'video' | 'audio',
    article_url: '',
    video_url: '',
    audio_url: ''
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
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: activeUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', thirtyDaysAgo.toISOString());

      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);

      const { count: newUsersThisMonth } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', firstDayOfMonth.toISOString());

      const { count: totalMessages } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true });

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const fileType = workshopForm.content_type;
    if (fileType === 'audio' && !file.type.startsWith('audio/')) {
      alert('Please upload an audio file');
      return;
    }
    if (fileType === 'video' && !file.type.startsWith('video/')) {
      alert('Please upload a video file');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `workshop-content/${fileType}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('workshop-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('workshop-media')
        .getPublicUrl(filePath);

      // Update form with the URL
      if (fileType === 'audio') {
        setWorkshopForm({ ...workshopForm, audio_url: publicUrl });
      } else if (fileType === 'video') {
        setWorkshopForm({ ...workshopForm, video_url: publicUrl });
      }

      alert('File uploaded successfully!');
    } catch (error: any) {
      console.error('Error uploading file:', error);
      alert('Error uploading file: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveWorkshop = async () => {
    if (!workshopForm.title.trim()) {
      alert('Please enter a title');
      return;
    }

    // Validate based on content type
    if (workshopForm.content_type === 'text' && !workshopForm.content.trim()) {
      alert('Please enter text content');
      return;
    }
    if (workshopForm.content_type === 'article' && !workshopForm.article_url.trim()) {
      alert('Please enter an article URL');
      return;
    }
    if (workshopForm.content_type === 'video' && !workshopForm.video_url.trim()) {
      alert('Please enter or upload a video');
      return;
    }
    if (workshopForm.content_type === 'audio' && !workshopForm.audio_url.trim()) {
      alert('Please enter or upload an audio file');
      return;
    }

    try {
      const workshopData = {
        title: workshopForm.title,
        description: workshopForm.description,
        content: workshopForm.content,
        stage: workshopForm.stage,
        content_type: workshopForm.content_type,
        article_url: workshopForm.content_type === 'article' ? workshopForm.article_url : null,
        video_url: workshopForm.content_type === 'video' ? workshopForm.video_url : null,
        audio_url: workshopForm.content_type === 'audio' ? workshopForm.audio_url : null,
      };

      if (editingWorkshop) {
        const { error } = await supabase
          .from('workshop_content')
          .update(workshopData)
          .eq('id', editingWorkshop.id);

        if (error) throw error;
        alert('Workshop updated successfully!');
      } else {
        const { error } = await supabase
          .from('workshop_content')
          .insert(workshopData);

        if (error) throw error;
        alert('Workshop added successfully!');
      }

      // Reset form
      setWorkshopForm({
        title: '',
        description: '',
        content: '',
        stage: 'awareness',
        content_type: 'text',
        article_url: '',
        video_url: '',
        audio_url: ''
      });
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
      stage: workshop.stage,
      content_type: workshop.content_type,
      article_url: workshop.article_url || '',
      video_url: workshop.video_url || '',
      audio_url: workshop.audio_url || ''
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

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return <TextIcon className="w-4 h-4" />;
      case 'article': return <LinkIcon className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'audio': return <Music className="w-4 h-4" />;
      default: return <TextIcon className="w-4 h-4" />;
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

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'stats'
                ? 'border-[#1a2332] text-[#1a2332]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Platform Stats
          </button>
          <button
            onClick={() => setActiveTab('workshops')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'workshops'
                ? 'border-[#1a2332] text-[#1a2332]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Workshop Content
          </button>
        </div>
      </div>

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-[#1a2332]">{stats.totalUsers}</p>
              </div>
              <Users className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Users (30 days)</p>
                <p className="text-3xl font-bold text-[#1a2332]">{stats.activeUsers}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">New This Month</p>
                <p className="text-3xl font-bold text-[#1a2332]">{stats.newUsersThisMonth}</p>
              </div>
              <Users className="w-12 h-12 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Messages</p>
                <p className="text-3xl font-bold text-[#1a2332]">{stats.totalMessages}</p>
              </div>
              <MessageSquare className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Journals</p>
                <p className="text-3xl font-bold text-[#1a2332]">{stats.totalJournals}</p>
              </div>
              <FileText className="w-12 h-12 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
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
          </div>
        </div>
      )}

      {/* Workshop Content Tab */}
      {activeTab === 'workshops' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-[#1a2332]">Workshop Content</h2>
            <button 
              onClick={() => {
                setShowAddWorkshop(true);
                setEditingWorkshop(null);
                setWorkshopForm({
                  title: '',
                  description: '',
                  content: '',
                  stage: 'awareness',
                  content_type: 'text',
                  article_url: '',
                  video_url: '',
                  audio_url: ''
                });
              }}
              className="bg-[#1a2332] text-white px-4 py-2 rounded-lg hover:bg-[#2d3e50] flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Workshop
            </button>
          </div>

          {/* Add/Edit Workshop Form */}
          {showAddWorkshop && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-4">
                {editingWorkshop ? 'Edit Workshop' : 'Add New Workshop'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={workshopForm.title}
                    onChange={(e) => setWorkshopForm({ ...workshopForm, title: e.target.value })}
                    placeholder="Workshop title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Stage</label>
                  <select
                    value={workshopForm.stage}
                    onChange={(e) => setWorkshopForm({ ...workshopForm, stage: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
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
                  <textarea
                    value={workshopForm.description}
                    onChange={(e) => setWorkshopForm({ ...workshopForm, description: e.target.value })}
                    placeholder="Brief description"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                  />
                </div>

                {/* Content Type Selector */}
                <div>
                  <label className="block text-sm font-medium mb-2">Content Type</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button
                      type="button"
                      onClick={() => setWorkshopForm({ ...workshopForm, content_type: 'text' })}
                      className={`flex flex-col items-center p-4 border-2 rounded-lg transition-colors ${
                        workshopForm.content_type === 'text'
                          ? 'border-[#1a2332] bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <TextIcon className="w-6 h-6 mb-2" />
                      <span className="text-sm font-medium">Text</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setWorkshopForm({ ...workshopForm, content_type: 'article' })}
                      className={`flex flex-col items-center p-4 border-2 rounded-lg transition-colors ${
                        workshopForm.content_type === 'article'
                          ? 'border-[#1a2332] bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <LinkIcon className="w-6 h-6 mb-2" />
                      <span className="text-sm font-medium">Article</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setWorkshopForm({ ...workshopForm, content_type: 'video' })}
                      className={`flex flex-col items-center p-4 border-2 rounded-lg transition-colors ${
                        workshopForm.content_type === 'video'
                          ? 'border-[#1a2332] bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Video className="w-6 h-6 mb-2" />
                      <span className="text-sm font-medium">Video</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setWorkshopForm({ ...workshopForm, content_type: 'audio' })}
                      className={`flex flex-col items-center p-4 border-2 rounded-lg transition-colors ${
                        workshopForm.content_type === 'audio'
                          ? 'border-[#1a2332] bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Music className="w-6 h-6 mb-2" />
                      <span className="text-sm font-medium">Audio</span>
                    </button>
                  </div>
                </div>

                {/* Content Input based on type */}
                {workshopForm.content_type === 'text' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Text Content</label>
                    <textarea
                      value={workshopForm.content}
                      onChange={(e) => setWorkshopForm({ ...workshopForm, content: e.target.value })}
                      placeholder="Full workshop content (markdown supported)"
                      rows={10}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                    />
                  </div>
                )}

                {workshopForm.content_type === 'article' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Article URL</label>
                    <input
                      type="url"
                      value={workshopForm.article_url}
                      onChange={(e) => setWorkshopForm({ ...workshopForm, article_url: e.target.value })}
                      placeholder="https://example.com/article"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                    />
                  </div>
                )}

                {workshopForm.content_type === 'video' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Video URL</label>
                      <input
                        type="url"
                        value={workshopForm.video_url}
                        onChange={(e) => setWorkshopForm({ ...workshopForm, video_url: e.target.value })}
                        placeholder="YouTube, Vimeo, or direct video URL"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                      />
                    </div>
                    <div className="text-center text-gray-500">OR</div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Upload Video File</label>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                      />
                      {uploading && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
                    </div>
                  </div>
                )}

                {workshopForm.content_type === 'audio' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Audio URL</label>
                      <input
                        type="url"
                        value={workshopForm.audio_url}
                        onChange={(e) => setWorkshopForm({ ...workshopForm, audio_url: e.target.value })}
                        placeholder="Direct audio file URL"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                      />
                    </div>
                    <div className="text-center text-gray-500">OR</div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Upload Audio File</label>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                      />
                      {uploading && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button 
                    onClick={handleSaveWorkshop}
                    disabled={uploading}
                    className="bg-[#1a2332] text-white px-4 py-2 rounded-lg hover:bg-[#2d3e50] disabled:opacity-50"
                  >
                    {editingWorkshop ? 'Update' : 'Save'} Workshop
                  </button>
                  <button 
                    onClick={() => {
                      setShowAddWorkshop(false);
                      setEditingWorkshop(null);
                      setWorkshopForm({
                        title: '',
                        description: '',
                        content: '',
                        stage: 'awareness',
                        content_type: 'text',
                        article_url: '',
                        video_url: '',
                        audio_url: ''
                      });
                    }}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Workshop List */}
          <div className="grid gap-4">
            {workshops.map((workshop) => (
              <div key={workshop.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold">{workshop.title}</h3>
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded flex items-center gap-1">
                        {getContentTypeIcon(workshop.content_type)}
                        {workshop.content_type}
                      </span>
                      <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                        {workshop.stage}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{workshop.description}</p>
                    <p className="text-sm text-gray-500">
                      Created: {new Date(workshop.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditWorkshop(workshop)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteWorkshop(workshop.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
