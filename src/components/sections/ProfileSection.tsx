import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, 
  Mail, 
  MapPin, 
  Briefcase, 
  Heart,
  Globe,
  Lock,
  Save,
  Upload,
  X,
  Plus,
  Edit2
} from 'lucide-react';

interface ProfileSectionProps {
  user?: any;
  onUpdate?: (updates: any) => void;
}

export function ProfileSection({ user: userProp, onUpdate }: ProfileSectionProps) {
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Enhanced fields
  const [bio, setBio] = useState('');
  const [occupation, setOccupation] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState('');
  const [goalsSummary, setGoalsSummary] = useState('');
  const [socialLinks, setSocialLinks] = useState({
    linkedin: '',
    twitter: '',
    instagram: '',
    website: ''
  });
  
  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    profile_visibility: 'private',
    show_goals: false,
    show_progress: false
  });
  
  const [preferredCommunication, setPreferredCommunication] = useState('email');

  useEffect(() => {
    loadProfile();
  }, [authUser]);

  const loadProfile = async () => {
    if (!authUser?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setFullName(data.full_name || '');
        setEmail(data.email || authUser.email || '');
        setAge(data.age?.toString() || '');
        setLocation(data.location || '');
        setCity(data.city || '');
        setState(data.state || '');
        setZipcode(data.zipcode || '');
        setPhoneNumber(data.phone_number || '');
        
        // Enhanced fields
        setBio(data.bio || '');
        setOccupation(data.occupation || '');
        setInterests(data.interests || []);
        setGoalsSummary(data.goals_summary || '');
        setSocialLinks(data.social_links || {
          linkedin: '',
          twitter: '',
          instagram: '',
          website: ''
        });
        setPrivacySettings(data.privacy_settings || {
          profile_visibility: 'private',
          show_goals: false,
          show_progress: false
        });
        setPreferredCommunication(data.preferred_communication || 'email');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      alert('Error loading profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!authUser?.id) return;

    setSaving(true);
    try {
      const updates = {
        full_name: fullName,
        age: age ? parseInt(age) : null,
        location: location,
        city: city,
        state: state,
        zipcode: zipcode,
        phone_number: phoneNumber,
        bio: bio,
        occupation: occupation,
        interests: interests,
        goals_summary: goalsSummary,
        social_links: socialLinks,
        privacy_settings: privacySettings,
        preferred_communication: preferredCommunication,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', authUser.id);

      if (error) throw error;

      alert('Profile updated successfully!');
      
      if (onUpdate) {
        onUpdate(updates);
      }
      
      loadProfile();
    } catch (error: any) {
      console.error('Error saving profile:', error);
      alert('Error saving profile: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a2332] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a2332] to-[#2d3e50] rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-gray-300">Manage your personal information and preferences</p>
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-[#1a2332] mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed here</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Your age"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="text-lg font-semibold text-[#1a2332] mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="State"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Zip Code</label>
                <input
                  type="text"
                  value={zipcode}
                  onChange={(e) => setZipcode(e.target.value)}
                  placeholder="12345"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Location (General)</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Los Angeles, CA"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                />
              </div>
            </div>
          </div>

          {/* About Me */}
          <div>
            <h3 className="text-lg font-semibold text-[#1a2332] mb-4 flex items-center gap-2">
              <Edit2 className="w-5 h-5" />
              About Me
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself... What drives you? What are you working towards?"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will be visible to your circle members if you choose to share it
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Occupation</label>
                <input
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  placeholder="What do you do?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Goals Summary</label>
                <textarea
                  value={goalsSummary}
                  onChange={(e) => setGoalsSummary(e.target.value)}
                  placeholder="What are your main goals and aspirations?"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                />
              </div>
            </div>
          </div>

          {/* Interests */}
          <div>
            <h3 className="text-lg font-semibold text-[#1a2332] mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Interests & Hobbies
            </h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddInterest();
                    }
                  }}
                  placeholder="Add an interest (e.g., reading, hiking, coding)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                />
                <button
                  onClick={handleAddInterest}
                  className="bg-[#1a2332] text-white px-4 py-2 rounded-md hover:bg-[#2d3e50] flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>

              {interests.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {interest}
                      <button
                        onClick={() => handleRemoveInterest(interest)}
                        className="hover:text-blue-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-lg font-semibold text-[#1a2332] mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Social Links
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">LinkedIn</label>
                <input
                  type="url"
                  value={socialLinks.linkedin}
                  onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Twitter</label>
                <input
                  type="url"
                  value={socialLinks.twitter}
                  onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                  placeholder="https://twitter.com/yourusername"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Instagram</label>
                <input
                  type="url"
                  value={socialLinks.instagram}
                  onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                  placeholder="https://instagram.com/yourusername"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Website</label>
                <input
                  type="url"
                  value={socialLinks.website}
                  onChange={(e) => setSocialLinks({ ...socialLinks, website: e.target.value })}
                  placeholder="https://yourwebsite.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                />
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div>
            <h3 className="text-lg font-semibold text-[#1a2332] mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Privacy & Communication
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Profile Visibility</label>
                <select
                  value={privacySettings.profile_visibility}
                  onChange={(e) => setPrivacySettings({ 
                    ...privacySettings, 
                    profile_visibility: e.target.value 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                >
                  <option value="private">Private - Only me</option>
                  <option value="circle">Circle - My circle members</option>
                  <option value="public">Public - Everyone</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={privacySettings.show_goals}
                    onChange={(e) => setPrivacySettings({ 
                      ...privacySettings, 
                      show_goals: e.target.checked 
                    })}
                    className="w-4 h-4 text-[#1a2332] focus:ring-[#1a2332]"
                  />
                  <span className="text-sm">Share my goals with circle members</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={privacySettings.show_progress}
                    onChange={(e) => setPrivacySettings({ 
                      ...privacySettings, 
                      show_progress: e.target.checked 
                    })}
                    className="w-4 h-4 text-[#1a2332] focus:ring-[#1a2332]"
                  />
                  <span className="text-sm">Share my workshop progress with circle</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Preferred Communication</label>
                <select
                  value={preferredCommunication}
                  onChange={(e) => setPreferredCommunication(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                >
                  <option value="email">Email only</option>
                  <option value="sms">SMS only</option>
                  <option value="both">Email and SMS</option>
                  <option value="none">No notifications</option>
                </select>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-6 border-t">
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full md:w-auto bg-[#1a2332] text-white px-8 py-3 rounded-lg hover:bg-[#2d3e50] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Profile
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
