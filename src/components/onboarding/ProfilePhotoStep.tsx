import { Button } from '@/components/ui/button';
import { ProfilePhotoUpload } from '@/components/profile/ProfilePhotoUpload';

interface ProfilePhotoStepProps {
  onNext: () => void;
  onSkip: () => void;
}

export function ProfilePhotoStep({ onNext, onSkip }: ProfilePhotoStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Add Your Photo</h2>
        <p className="text-gray-600">
          Help your accountability partners recognize you
        </p>
      </div>
      
      <div className="flex justify-center">
        <ProfilePhotoUpload />
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
