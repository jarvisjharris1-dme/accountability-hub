import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface BioStepProps {
  initialBio?: string;
  onNext: (bio: string) => void;
  onSkip: () => void;
}

export function BioStep({ initialBio = '', onNext, onSkip }: BioStepProps) {
  const [bio, setBio] = useState(initialBio);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Tell Us About Yourself</h2>
        <p className="text-gray-600">
          Share a bit about your journey and what brings you here
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Your Bio</Label>
        <Textarea
          id="bio"
          placeholder="I'm passionate about personal growth and accountability..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={6}
          className="resize-none"
        />
        <p className="text-sm text-gray-500">{bio.length} / 500 characters</p>
      </div>

      <div className="space-y-3">
        <Button 
          onClick={() => onNext(bio)} 
          className="w-full bg-[#d4a574] hover:bg-[#c49564]"
          disabled={bio.length > 500}
        >
          Continue
        </Button>
        <Button onClick={onSkip} variant="ghost" className="w-full">
          Skip for now
        </Button>
      </div>
    </div>
  );
}
