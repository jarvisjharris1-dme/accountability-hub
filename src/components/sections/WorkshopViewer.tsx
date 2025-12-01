import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BookOpen, 
  Play, 
  FileText, 
  Link as LinkIcon,
  Video,
  Music,
  Check,
  ChevronRight,
  Clock,
  Award
} from 'lucide-react';

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
  created_at: string;
}

interface WorkshopProgress {
  workshop_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress_percentage: number;
  started_at?: string;
  completed_at?: string;
}

const STAGES = [
  { id: 'Awareness', name: 'Awareness', description: 'Understanding yourself', color: 'blue' },
  { id: 'Acceptance', name: 'Acceptance', description: 'Embracing your truth', color: 'purple' },
  { id: 'Accountability', name: 'Accountability', description: 'Taking ownership', color: 'green' },
  { id: 'Action', name: 'Action', description: 'Making moves', color: 'orange' },
  { id: 'Achievement', name: 'Achievement', description: 'Reaching milestones', color: 'red' },
  { id: 'Advocacy', name: 'Advocacy', description: 'Supporting others', color: 'pink' },
  { id: 'Abundance', name: 'Abundance', description: 'Living fully', color: 'yellow' }
];

export function WorkshopViewer() {
  const { user } = useAuth();
  const [selectedStage, setSelectedStage] = useState<string>('Awareness');
  const [workshops, setWorkshops] = useState<WorkshopContent[]>([]);
  const [progress, setProgress] = useState<Record<string, WorkshopProgress>>({});
  const [selectedWorkshop, setSelectedWorkshop] = useState<WorkshopContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkshops();
    loadProgress();
  }, [user]);

  const loadWorkshops = async () => {
    try {
      const { data, error } = await supabase
        .from('workshops')  // ✅ FIXED: Changed from 'workshop_content' to 'workshops'
        .select('*')
        .eq('is_published', true)  // ✅ ADDED: Only load published workshops
        .order('order_index', { ascending: true });  // ✅ FIXED: Order by order_index instead of created_at

      if (error) throw error;
      setWorkshops(data || []);
    } catch (error) {
      console.error('Error loading workshops:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_workshop_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const progressMap: Record<string, WorkshopProgress> = {};
      data?.forEach(p => {
        progressMap[p.workshop_id] = p;
      });
      setProgress(progressMap);
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const handleStartWorkshop = async (workshop: WorkshopContent) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('user_workshop_progress')
        .upsert(
          {
            user_id: user.id,
            workshop_id: workshop.id,
            status: 'in_progress',
            started_at: new Date().toISOString(),
            progress_percentage: 10,
            last_accessed_at: new Date().toISOString()
          },
          {
            onConflict: 'user_id,workshop_id'
          }
        );

      if (error) throw error;
      setSelectedWorkshop(workshop);
      loadProgress();
    } catch (error: any) {
      console.error('Error starting workshop:', error);
      alert('Error starting workshop: ' + error.message);
    }
  };

  const handleCompleteWorkshop = async (workshopId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('user_workshop_progress')
        .upsert(
          {
            user_id: user.id,
            workshop_id: workshopId,
            status: 'completed',
            completed_at: new Date().toISOString(),
            progress_percentage: 100,
            last_accessed_at: new Date().toISOString()
          },
          {
            onConflict: 'user_id,workshop_id'
          }
        );

      if (error) throw error;
      alert('🎉 Workshop completed! Great work!');
      loadProgress();
    } catch (error: any) {
      console.error('Error completing workshop:', error);
      alert('Error completing workshop: ' + error.message);
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return <FileText className="w-5 h-5" />;
      case 'article': return <LinkIcon className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      case 'audio': return <Music className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getStageColor = (stageId: string) => {
    const stage = STAGES.find(s => s.id === stageId);
    return stage?.color || 'gray';
  };

  const stageWorkshops = workshops.filter(w => w.stage === selectedStage);
  const completedInStage = stageWorkshops.filter(w => progress[w.id]?.status === 'completed').length;
  const totalInStage = stageWorkshops.length;

  const renderWorkshopContent = (workshop: WorkshopContent) => {
    switch (workshop.content_type) {
      case 'text':
        return (
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap">{workshop.content}</div>
          </div>
        );

      case 'article':
        return (
          <div className="space-y-4">
            <p className="text-gray-600">{workshop.description}</p>
            <a
              href={workshop.article_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#1a2332] text-white px-6 py-3 rounded-lg hover:bg-[#2d3e50]"
            >
              <LinkIcon className="w-5 h-5" />
              Read Article
            </a>
          </div>
        );

      case 'video':
        return (
          <div className="space-y-4">
            <p className="text-gray-600">{workshop.description}</p>
            {workshop.video_url && (
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                {workshop.video_url.includes('youtube.com') || workshop.video_url.includes('youtu.be') ? (
                  <iframe
                    src={workshop.video_url.replace('watch?v=', 'embed/')}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : workshop.video_url.includes('vimeo.com') ? (
                  <iframe
                    src={workshop.video_url.replace('vimeo.com/', 'player.vimeo.com/video/')}
                    className="w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video controls className="w-full h-full">
                    <source src={workshop.video_url} />
                    Your browser does not support video playback.
                  </video>
                )}
              </div>
            )}
          </div>
        );

      case 'audio':
        return (
          <div className="space-y-4">
            <p className="text-gray-600">{workshop.description}</p>
            {workshop.audio_url && (
              <audio controls className="w-full">
                <source src={workshop.audio_url} />
                Your browser does not support audio playback.
              </audio>
            )}
          </div>
        );

      default:
        return <p className="text-gray-500">Content type not supported</p>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a2332] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading workshops...</p>
        </div>
      </div>
    );
  }

  if (selectedWorkshop) {
    const workshopProgress = progress[selectedWorkshop.id];
    const isCompleted = workshopProgress?.status === 'completed';

    return (
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => setSelectedWorkshop(null)}
          className="text-[#1a2332] hover:underline flex items-center gap-2"
        >
          ← Back to Workshops
        </button>

        {/* Workshop Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {getContentTypeIcon(selectedWorkshop.content_type)}
                <span className={`px-3 py-1 text-sm rounded bg-${getStageColor(selectedWorkshop.stage)}-100 text-${getStageColor(selectedWorkshop.stage)}-800`}>
                  {STAGES.find(s => s.id === selectedWorkshop.stage)?.name}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-[#1a2332] mb-2">{selectedWorkshop.title}</h1>
              <p className="text-gray-600">{selectedWorkshop.description}</p>
            </div>
            {isCompleted && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                <Check className="w-5 h-5" />
                <span className="font-medium">Completed</span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {workshopProgress && !isCompleted && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{workshopProgress.progress_percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#1a2332] h-2 rounded-full transition-all"
                  style={{ width: `${workshopProgress.progress_percentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Content */}
          <div className="mt-6">
            {renderWorkshopContent(selectedWorkshop)}
          </div>

          {/* Complete Button */}
          {!isCompleted && (
            <div className="mt-6 pt-6 border-t">
              <button
                onClick={() => handleCompleteWorkshop(selectedWorkshop.id)}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Mark as Complete
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a2332] to-[#2d3e50] rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Workshop Library</h1>
        <p className="text-gray-300">Your journey through the 7 stages of personal development</p>
      </div>

      {/* Stage Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-3">
        {STAGES.map((stage) => {
          const stageWorkshopsCount = workshops.filter(w => w.stage === stage.id).length;
          const completedCount = workshops.filter(w => 
            w.stage === stage.id && progress[w.id]?.status === 'completed'
          ).length;

          return (
            <button
              key={stage.id}
              onClick={() => setSelectedStage(stage.id)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedStage === stage.id
                  ? `border-${stage.color}-500 bg-${stage.color}-50`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <h3 className="font-semibold mb-1">{stage.name}</h3>
                <p className="text-xs text-gray-600 mb-2">{stage.description}</p>
                <div className="text-xs text-gray-500">
                  {completedCount}/{stageWorkshopsCount} completed
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Stage Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-[#1a2332] mb-2">
              {STAGES.find(s => s.id === selectedStage)?.name}
            </h2>
            <p className="text-gray-600">
              {STAGES.find(s => s.id === selectedStage)?.description}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-[#1a2332]">
              {completedInStage}/{totalInStage}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
        </div>
      </div>

      {/* Workshop Grid */}
      {stageWorkshops.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Workshops Yet</h3>
          <p className="text-gray-500">Check back soon for new content in this stage!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stageWorkshops.map((workshop) => {
            const workshopProgress = progress[workshop.id];
            const isCompleted = workshopProgress?.status === 'completed';
            const isInProgress = workshopProgress?.status === 'in_progress';

            return (
              <div
                key={workshop.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {getContentTypeIcon(workshop.content_type)}
                      <span className="text-xs font-medium text-gray-500 uppercase">
                        {workshop.content_type}
                      </span>
                    </div>
                    {isCompleted && (
                      <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Done
                      </div>
                    )}
                    {isInProgress && (
                      <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        In Progress
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl font-semibold text-[#1a2332] mb-2">
                    {workshop.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {workshop.description}
                  </p>

                  {workshopProgress && !isCompleted && (
                    <div className="mb-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#1a2332] h-2 rounded-full transition-all"
                          style={{ width: `${workshopProgress.progress_percentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      if (!workshopProgress) {
                        handleStartWorkshop(workshop);
                      } else {
                        setSelectedWorkshop(workshop);
                      }
                    }}
                    className="w-full bg-[#1a2332] text-white py-2 rounded-lg hover:bg-[#2d3e50] flex items-center justify-center gap-2"
                  >
                    {isCompleted ? (
                      <>
                        <Award className="w-4 h-4" />
                        Review
                      </>
                    ) : isInProgress ? (
                      <>
                        <Play className="w-4 h-4" />
                        Continue
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Start
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
