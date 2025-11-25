import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Calendar,
  Plus,
  Clock,
  CheckCircle,
  Smile,
  Meh,
  Frown,
  AlertCircle,
  Heart,
  X,
  Edit2,
  Trash2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CheckIn {
  id: string;
  title: string;
  description: string;
  check_in_type: 'daily' | 'weekly' | 'monthly' | 'manual';
  scheduled_time: string;
  scheduled_days: number[];
  is_active: boolean;
  created_at: string;
}

interface CheckInResponse {
  id: string;
  check_in_id: string;
  user_id: string;
  response_text: string;
  mood: 'great' | 'good' | 'okay' | 'struggling' | 'crisis';
  created_at: string;
  user_name?: string;
}

interface CheckInsProps {
  circleId: string;
  isOwner?: boolean;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MOODS = [
  { value: 'great', label: 'Great', icon: Smile, color: 'green' },
  { value: 'good', label: 'Good', icon: Heart, color: 'blue' },
  { value: 'okay', label: 'Okay', icon: Meh, color: 'yellow' },
  { value: 'struggling', label: 'Struggling', icon: Frown, color: 'orange' },
  { value: 'crisis', label: 'Crisis', icon: AlertCircle, color: 'red' }
];

export function CheckIns({ circleId, isOwner = false }: CheckInsProps) {
  const { user } = useAuth();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [responses, setResponses] = useState<CheckInResponse[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCheckIn, setSelectedCheckIn] = useState<CheckIn | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    check_in_type: 'weekly' as 'daily' | 'weekly' | 'monthly' | 'manual',
    scheduled_time: '09:00',
    scheduled_days: [] as number[]
  });

  // Response form state
  const [responseText, setResponseText] = useState('');
  const [selectedMood, setSelectedMood] = useState<string>('good');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCheckIns();
  }, [circleId]);

  useEffect(() => {
    if (checkIns.length > 0) {
      loadResponses();
    }
  }, [checkIns]);

  const loadCheckIns = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('scheduled_check_ins')
        .select('*')
        .eq('circle_id', circleId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCheckIns(data || []);
    } catch (error) {
      console.error('Error loading check-ins:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadResponses = async () => {
    if (!user?.id || checkIns.length === 0) return;

    try {
      const checkInIds = checkIns.map(c => c.id);
      
      // Load responses
      const { data: responsesData, error: responsesError } = await supabase
        .from('check_in_responses')
        .select('*')
        .in('check_in_id', checkInIds)
        .order('created_at', { ascending: false })
        .limit(50);

      if (responsesError) throw responsesError;

      // Load user info for all responders
      if (responsesData && responsesData.length > 0) {
        const userIds = [...new Set(responsesData.map(r => r.user_id))];
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);

        if (profilesError) throw profilesError;

        // Combine the data
        const formattedResponses = responsesData.map(r => {
          const profile = profilesData?.find(p => p.id === r.user_id);
          return {
            ...r,
            user_name: profile?.full_name || 'Unknown User'
          };
        });

        setResponses(formattedResponses);
      } else {
        setResponses([]);
      }
    } catch (error) {
      console.error('Error loading responses:', error);
      setResponses([]);
    }
  };

  const handleCreateCheckIn = async () => {
    if (!user?.id || !formData.title.trim()) {
      alert('Please enter a check-in title');
      return;
    }

    try {
      const { error } = await supabase
        .from('scheduled_check_ins')
        .insert({
          created_by: user.id,
          circle_id: circleId,
          title: formData.title,
          description: formData.description,
          check_in_type: formData.check_in_type,
          scheduled_time: formData.scheduled_time,
          scheduled_days: formData.scheduled_days,
          is_active: true
        });

      if (error) throw error;

      alert('Check-in created successfully!');
      setFormData({
        title: '',
        description: '',
        check_in_type: 'weekly',
        scheduled_time: '09:00',
        scheduled_days: []
      });
      setShowCreateForm(false);
      loadCheckIns();
    } catch (error: any) {
      console.error('Error creating check-in:', error);
      alert('Error creating check-in: ' + error.message);
    }
  };

  const handleSubmitResponse = async (checkInId: string) => {
    if (!user?.id || !responseText.trim()) {
      alert('Please enter your check-in response');
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await supabase
        .from('check_in_responses')
        .insert({
          check_in_id: checkInId,
          user_id: user.id,
          response_text: responseText.trim(),
          mood: selectedMood
        });

      if (error) throw error;

      alert('Check-in submitted! 🎉');
      setResponseText('');
      setSelectedMood('good');
      setSelectedCheckIn(null);
      loadResponses();
    } catch (error: any) {
      console.error('Error submitting response:', error);
      alert('Error submitting response: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCheckIn = async (checkInId: string) => {
    if (!confirm('Are you sure you want to delete this check-in?')) return;

    try {
      const { error } = await supabase
        .from('scheduled_check_ins')
        .update({ is_active: false })
        .eq('id', checkInId);

      if (error) throw error;
      alert('Check-in deleted');
      loadCheckIns();
    } catch (error: any) {
      console.error('Error deleting check-in:', error);
      alert('Error deleting check-in: ' + error.message);
    }
  };

  const toggleDay = (day: number) => {
    setFormData(prev => ({
      ...prev,
      scheduled_days: prev.scheduled_days.includes(day)
        ? prev.scheduled_days.filter(d => d !== day)
        : [...prev.scheduled_days, day]
    }));
  };

  const getMoodIcon = (mood: string) => {
    const moodData = MOODS.find(m => m.value === mood);
    if (!moodData) return null;
    const Icon = moodData.icon;
    return <Icon className={`w-5 h-5 text-${moodData.color}-600`} />;
  };

  const getCheckInResponses = (checkInId: string) => {
    return responses.filter(r => r.check_in_id === checkInId);
  };

  const hasUserResponded = (checkInId: string) => {
    return responses.some(r => r.check_in_id === checkInId && r.user_id === user?.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a2332] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading check-ins...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-[#1a2332]">Accountability Check-Ins</h3>
          <p className="text-gray-600">Stay accountable with regular check-ins</p>
        </div>
        {isOwner && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-[#1a2332] text-white px-4 py-2 rounded-lg hover:bg-[#2d3e50] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Check-In
          </button>
        )}
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold">Create Check-In</h4>
            <button onClick={() => setShowCreateForm(false)}>
              <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Daily Progress Check"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What should members share in this check-in?"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Frequency</label>
                <select
                  value={formData.check_in_type}
                  onChange={(e) => setFormData({ ...formData, check_in_type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="manual">Manual</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Time</label>
                <input
                  type="time"
                  value={formData.scheduled_time}
                  onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                />
              </div>
            </div>

            {formData.check_in_type === 'weekly' && (
              <div>
                <label className="block text-sm font-medium mb-2">Days of Week</label>
                <div className="flex gap-2">
                  {DAYS.map((day, index) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(index)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${
                        formData.scheduled_days.includes(index)
                          ? 'bg-[#1a2332] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleCreateCheckIn}
                className="bg-[#1a2332] text-white px-6 py-2 rounded-lg hover:bg-[#2d3e50]"
              >
                Create Check-In
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Check-Ins List */}
      {checkIns.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Check-Ins Yet</h3>
          <p className="text-gray-500 mb-4">
            {isOwner 
              ? 'Create your first check-in to start building accountability!'
              : 'Check-ins will appear here when your circle leader creates them.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {checkIns.map((checkIn) => {
            const checkInResponses = getCheckInResponses(checkIn.id);
            const userResponded = hasUserResponded(checkIn.id);

            return (
              <div key={checkIn.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-xl font-semibold text-[#1a2332]">{checkIn.title}</h4>
                        <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                          {checkIn.check_in_type}
                        </span>
                      </div>
                      {checkIn.description && (
                        <p className="text-gray-600 mb-2">{checkIn.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {checkIn.scheduled_time}
                        </span>
                        {checkIn.scheduled_days && checkIn.scheduled_days.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {checkIn.scheduled_days.map(d => DAYS[d]).join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                    {isOwner && (
                      <button
                        onClick={() => handleDeleteCheckIn(checkIn.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Response Section */}
                  {userResponded ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">You've completed this check-in!</span>
                      </div>
                    </div>
                  ) : (
                    selectedCheckIn?.id === checkIn.id ? (
                      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">How are you doing?</label>
                          <div className="flex gap-2">
                            {MOODS.map((mood) => {
                              const Icon = mood.icon;
                              return (
                                <button
                                  key={mood.value}
                                  onClick={() => setSelectedMood(mood.value)}
                                  className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                                    selectedMood === mood.value
                                      ? `border-${mood.color}-500 bg-${mood.color}-50`
                                      : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  <Icon className={`w-6 h-6 mx-auto mb-1 text-${mood.color}-600`} />
                                  <span className="text-xs font-medium">{mood.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Your Response *</label>
                          <textarea
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            placeholder="Share your progress, challenges, or what's on your mind..."
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSubmitResponse(checkIn.id)}
                            disabled={submitting}
                            className="bg-[#1a2332] text-white px-6 py-2 rounded-lg hover:bg-[#2d3e50] disabled:opacity-50"
                          >
                            {submitting ? 'Submitting...' : 'Submit Check-In'}
                          </button>
                          <button
                            onClick={() => setSelectedCheckIn(null)}
                            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedCheckIn(checkIn)}
                        className="w-full bg-[#1a2332] text-white py-2 rounded-lg hover:bg-[#2d3e50]"
                      >
                        Complete Check-In
                      </button>
                    )
                  )}

                  {/* Recent Responses */}
                  {checkInResponses.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h5 className="font-medium text-gray-700 mb-3">Recent Responses ({checkInResponses.length})</h5>
                      <div className="space-y-3">
                        {checkInResponses.slice(0, 3).map((response) => (
                          <div key={response.id} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-start gap-2 mb-2">
                              {getMoodIcon(response.mood)}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium">{response.user_name}</span>
                                  <span className="text-xs text-gray-500">
                                    {formatDistanceToNow(new Date(response.created_at), { addSuffix: true })}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700">{response.response_text}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
