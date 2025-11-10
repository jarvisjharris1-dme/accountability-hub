import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface WelcomeStepProps {
  userName: string;
  onNext: () => void;
}

export function WelcomeStep({ userName, onNext }: WelcomeStepProps) {
  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="w-20 h-20 bg-[#d4a574] rounded-full flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
      </div>
      <div>
        <h2 className="text-3xl font-bold mb-2">Welcome, {userName}!</h2>
        <p className="text-gray-600 text-lg">
          Let's get you set up in just a few quick steps
        </p>
      </div>
      <div className="bg-gray-50 rounded-lg p-6 space-y-3 text-left">
        <p className="flex items-center gap-2">
          <span className="w-6 h-6 bg-[#d4a574] text-white rounded-full flex items-center justify-center text-sm">1</span>
          Upload your profile photo
        </p>
        <p className="flex items-center gap-2">
          <span className="w-6 h-6 bg-[#d4a574] text-white rounded-full flex items-center justify-center text-sm">2</span>
          Tell us about yourself
        </p>
        <p className="flex items-center gap-2">
          <span className="w-6 h-6 bg-[#d4a574] text-white rounded-full flex items-center justify-center text-sm">3</span>
          Choose your focus areas
        </p>
        <p className="flex items-center gap-2">
          <span className="w-6 h-6 bg-[#d4a574] text-white rounded-full flex items-center justify-center text-sm">4</span>
          Set your first goal
        </p>
      </div>
      <Button onClick={onNext} className="w-full bg-[#d4a574] hover:bg-[#c49564]">
        Get Started
      </Button>
    </div>
  );
}
