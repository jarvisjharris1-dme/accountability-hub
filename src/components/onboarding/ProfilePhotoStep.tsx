import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ProfilePhotoUpload } from '@/components/profile/ProfilePhotoUpload';

interface ProfilePhotoStepProps {
  onNext: () => void;
  onSkip: () => void;
}

export function ProfilePhotoStep({ onNext, onSkip }: ProfilePhotoStepProps) {
  const { user } = useAuth();
  const [photo, setPhoto] = useState<string>();
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Add Your Photo</h2>
        <p className="text-gray-600">
          Help your accountability partners recognize you
        </p>
      </div>
      
      <div className="flex justify-center">
        {user && <ProfilePhotoUpload userId={user.id} currentPhotoUrl={photo} onPhotoUpdate={setPhoto} userName={user.user_metadata?.full_name} />}
      </div>

      <div className="space-y-3">
        <Button onClick={onNext} className="w-full bg-[#d4a574] hover:bg-[#c49564]">
          Continue
        </Button>
        <Button onClick={onSkip} variant="ghost" className="w-full">
          Skip for now
        </Button>
      </div>
    </div>
  );
}
