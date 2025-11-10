import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { UserProfile, AccountabilityArea } from '../../types';
import { UserBadges } from '@/components/achievements/UserBadges';
import { TwoFactorSettings } from './TwoFactorSettings';
import { SessionManagement } from './SessionManagement';
import { LanguageSelector } from '@/components/profile/LanguageSelector';
import { PhoneVerification } from '@/components/profile/PhoneVerification';

import { ProfilePhotoUpload } from '@/components/profile/ProfilePhotoUpload';

interface ProfileSectionProps {
  user: UserProfile;
  onUpdate: (updates: Partial<UserProfile>) => void;
}

const areaLabels: Record<AccountabilityArea, string> = {
  sex: 'Sexual Integrity',
  relationship: 'Relationship Commitment',
  drugs: 'Drug Use',
  alcohol: 'Alcohol Use',
  gambling: 'Gambling',
  important_dates: 'Important Dates',
  financial: 'Financial Responsibility',
  children: 'Parenting'
};

export const ProfileSection: React.FC<ProfileSectionProps> = ({ user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user);
  const [isSaving, setIsSaving] = useState(false);
  const { signOut, user: authUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSave = async () => {
    if (!authUser) return;
    
    setIsSaving(true);
    try {
      // Prepare the update payload with proper field mapping
      const updatePayload: any = {
        full_name: formData.name,  // Database column is 'full_name', not 'name'
        age: formData.age,
        location: formData.location,
        accountability_areas: formData.accountabilityAreas,
      };

      // Only include optional fields if they have values
      if (formData.city) updatePayload.city = formData.city;
      if (formData.state) updatePayload.state = formData.state;
      if (formData.zipcode) updatePayload.zipcode = formData.zipcode;
      if (formData.sex) updatePayload.sex = formData.sex;
      if (formData.ethnicity) updatePayload.ethnicity = formData.ethnicity;
      if (formData.familyStatus) updatePayload.family_status = formData.familyStatus;

      console.log('Updating profile with payload:', updatePayload);

      const { data, error } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', authUser.id)
        .select();

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }

      console.log('Update successful:', data);
      onUpdate(formData);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      
      // More detailed error message
      const errorMessage = error?.message || 'Failed to update profile';
      const errorDetails = error?.details || '';
      const errorHint = error?.hint || '';
      
      console.error('Full error:', { errorMessage, errorDetails, errorHint });
      alert(`Failed to update profile: ${errorMessage}${errorDetails ? '\n' + errorDetails : ''}${errorHint ? '\n' + errorHint : ''}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpdate = (url: string) => {
    setFormData(prev => ({ ...prev, avatar: url }));
    onUpdate({ ...formData, avatar: url });
  };

  const toggleArea = (area: AccountabilityArea) => {
    setFormData(prev => ({
      ...prev,
      accountabilityAreas: prev.accountabilityAreas.includes(area)
        ? prev.accountabilityAreas.filter(a => a !== area)
        : [...prev.accountabilityAreas, area]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#1a2332]">My Profile</h2>
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            disabled={isSaving}
            className="px-4 py-2 bg-[#d4a574] text-white rounded-lg font-medium hover:bg-[#c49564] transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : isEditing ? 'Save' : 'Edit'}
          </button>
        </div>

        <div className="mb-6 pb-6 border-b">
          <ProfilePhotoUpload
            currentPhotoUrl={formData.avatar}
            userId={authUser?.id || ''}
            onPhotoUpdate={handlePhotoUpdate}
            userName={formData.name}
          />
        </div>

        <div className="mb-6 pb-6 border-b">
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4a574] focus:border-transparent"
                placeholder="Name"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4a574] focus:border-transparent"
                  placeholder="Age"
                />
                <select
                  value={formData.sex || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, sex: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4a574] focus:border-transparent"
                >
                  <option value="">Select Sex</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4a574] focus:border-transparent"
                placeholder="Location"
              />
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  value={formData.city || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4a574] focus:border-transparent"
                  placeholder="City"
                />
                <input
                  type="text"
                  value={formData.state || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4a574] focus:border-transparent"
                  placeholder="State"
                />
                <input
                  type="text"
                  value={formData.zipcode || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, zipcode: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4a574] focus:border-transparent"
                  placeholder="Zipcode"
                />
              </div>
              <select
                value={formData.ethnicity || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, ethnicity: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4a574] focus:border-transparent"
              >
                <option value="">Select Ethnicity</option>
                <option value="asian">Asian</option>
                <option value="black">Black or African American</option>
                <option value="hispanic">Hispanic or Latino</option>
                <option value="native_american">Native American</option>
                <option value="pacific_islander">Pacific Islander</option>
                <option value="white">White</option>
                <option value="mixed">Mixed</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
              <input
                type="text"
                value={formData.familyStatus}
                onChange={(e) => setFormData(prev => ({ ...prev, familyStatus: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4a574] focus:border-transparent"
                placeholder="Family Status"
              />
            </div>
          ) : (
            <div>
              <h3 className="text-2xl font-bold text-[#1a2332]">{user.name}</h3>
              <p className="text-gray-600">{user.age} years old{user.sex && ` • ${user.sex.charAt(0).toUpperCase() + user.sex.slice(1).replace('_', ' ')}`}</p>
              <p className="text-gray-600">{user.location}</p>
              {(user.city || user.state || user.zipcode) && (
                <p className="text-gray-600">
                  {[user.city, user.state, user.zipcode].filter(Boolean).join(', ')}
                </p>
              )}
              {user.ethnicity && (
                <p className="text-gray-600">Ethnicity: {user.ethnicity.charAt(0).toUpperCase() + user.ethnicity.slice(1).replace('_', ' ')}</p>
              )}
              <p className="text-gray-600">{user.familyStatus}</p>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-[#1a2332] mb-4">Accountability Areas</h3>
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(areaLabels) as AccountabilityArea[]).map(area => (
              <button
                key={area}
                onClick={() => isEditing && toggleArea(area)}
                disabled={!isEditing}
                className={`p-3 rounded-lg text-left transition-colors ${
                  formData.accountabilityAreas.includes(area)
                    ? 'bg-[#d4a574] text-white'
                    : 'bg-gray-100 text-gray-700'
                } ${isEditing ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
              >
                <span className="text-sm font-medium">{areaLabels[area]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <UserBadges userId={user.id} />
        </div>

        <div className="mt-6">
          <TwoFactorSettings />
        </div>

        <div className="mt-6">
          <PhoneVerification
            userId={authUser?.id || ''}
            currentPhone={user.phone_number}
            isVerified={user.phone_verified}
            onVerified={() => {
              onUpdate({ ...user, phone_verified: true });
            }}
          />
        </div>

        <div className="mt-6">
          <LanguageSelector />
        </div>

        <div className="mt-6">
          <SessionManagement />
        </div>

        <div className="mt-6 pt-6 border-t">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
