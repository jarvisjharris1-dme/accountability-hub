import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { OnboardingProgress } from './OnboardingProgress';
import { WelcomeStep } from './WelcomeStep';
import { ProfilePhotoStep } from './ProfilePhotoStep';
import { BioStep } from './BioStep';
import { AccountabilityAreasStep } from './AccountabilityAreasStep';
import { InitialGoalStep } from './InitialGoalStep';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const STEPS = ['Welcome', 'Photo', 'Bio', 'Focus Areas', 'First Goal'];

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [bio, setBio] = useState('');
  const [areas, setAreas] = useState<string[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleNext = () => setCurrentStep(prev => prev + 1);
  
  const handleBioNext = (bioText: string) => {
    setBio(bioText);
    handleNext();
  };

  const handleAreasNext = async (selectedAreas: string[]) => {
    setAreas(selectedAreas);
    
    // Save areas to database
    if (selectedAreas.length > 0) {
      const areaRecords = selectedAreas.map(area => ({
        user_id: user?.id,
        area_name: area,
      }));
      
      await supabase.from('accountability_areas').insert(areaRecords);
    }
    
    handleNext();
  };

  const handleComplete = async (goal?: any) => {
    try {
      // Update profile with bio and onboarding completion
      await supabase
        .from('profiles')
        .update({ 
          bio,
          onboarding_completed: true 
        })
        .eq('id', user?.id);

      // Create initial goal if provided
      if (goal) {
        await supabase.from('goals').insert({
          user_id: user?.id,
          title: goal.title,
          description: goal.description,
          category: goal.category,
          target_date: goal.targetDate,
          status: 'in_progress',
        });
      }

      toast.success('Welcome! Your profile is all set up.');
      navigate('/');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Failed to complete setup');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8">
        <OnboardingProgress currentStep={currentStep} totalSteps={STEPS.length} steps={STEPS} />
        
        {currentStep === 0 && (
          <WelcomeStep userName={user?.user_metadata?.full_name || 'there'} onNext={handleNext} />
        )}
        {currentStep === 1 && (
          <ProfilePhotoStep onNext={handleNext} onSkip={handleNext} />
        )}
        {currentStep === 2 && (
          <BioStep initialBio={bio} onNext={handleBioNext} onSkip={handleNext} />
        )}
        {currentStep === 3 && (
          <AccountabilityAreasStep onNext={handleAreasNext} onSkip={handleNext} />
        )}
        {currentStep === 4 && (
          <InitialGoalStep onComplete={handleComplete} onSkip={() => handleComplete()} />
        )}
      </Card>
    </div>
  );
}
