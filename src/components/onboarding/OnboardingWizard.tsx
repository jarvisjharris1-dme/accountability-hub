import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { OnboardingProgress } from "./OnboardingProgress";
import { WelcomeStep } from "./WelcomeStep";
import { ProfilePhotoStep } from "./ProfilePhotoStep";
import { BioStep } from "./BioStep";
import { AccountabilityAreasStep } from "./AccountabilityAreasStep";
import { InitialGoalStep } from "./InitialGoalStep";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const STEPS = ["Welcome", "Photo", "Bio", "Focus Areas", "First Goal"];

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [initialGoalId] = useState(() => crypto.randomUUID());
  const [areas, setAreas] = useState<string[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleNext = () => setCurrentStep((prev) => prev + 1);

  const handleBioNext = (bioText: string) => {
    setBio(bioText);
    handleNext();
  };

  const handleAreasNext = async (selectedAreas: string[]) => {
    if (!user?.id || saving) return;
    setSaving(true);
    try {
      if (selectedAreas.length) {
        const { error } = await supabase
          .from("accountability_areas")
          .insert(
            selectedAreas.map((area) => ({
              user_id: user.id,
              area_name: area,
            })),
          );
        if (error) throw error;
      }
      setAreas(selectedAreas);
      handleNext();
    } catch (error) {
      console.error("Error saving focus areas:", error);
      toast.error("Your focus areas could not be saved. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async (goal?: {
    title: string;
    description: string;
    category: string;
    targetDate: string;
  }) => {
    if (!user?.id || saving) return;
    setSaving(true);
    try {
      // Save the profile first, then the goal, and only finish after both succeed.
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ bio })
        .eq("id", user.id);
      if (profileError) throw profileError;
      if (goal) {
        const { error: goalError } = await supabase.from("goals").upsert(
          {
            id: initialGoalId,
            user_id: user.id,
            title: goal.title,
            description: goal.description,
            category: goal.category,
            target_date: goal.targetDate || null,
            status: "active",
            progress_percentage: 0,
          },
          { onConflict: "id" },
        );
        if (goalError) throw goalError;
      }
      const { error: completionError } = await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", user.id);
      if (completionError) throw completionError;
      toast.success("Your account is ready. Let’s take the next step.");
      navigate("/");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error("Setup could not be completed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-4 sm:p-8">
        <fieldset disabled={saving} aria-busy={saving}>
          <OnboardingProgress
            currentStep={currentStep}
            totalSteps={STEPS.length}
            steps={STEPS}
          />

          {currentStep === 0 && (
            <WelcomeStep
              userName={user?.user_metadata?.full_name || "there"}
              onNext={handleNext}
            />
          )}
          {currentStep === 1 && (
            <ProfilePhotoStep onNext={handleNext} onSkip={handleNext} />
          )}
          {currentStep === 2 && (
            <BioStep
              initialBio={bio}
              onNext={handleBioNext}
              onSkip={handleNext}
            />
          )}
          {currentStep === 3 && (
            <AccountabilityAreasStep
              onNext={handleAreasNext}
              onSkip={handleNext}
            />
          )}
          {currentStep === 4 && (
            <InitialGoalStep
              onComplete={handleComplete}
              onSkip={() => handleComplete()}
            />
          )}
        </fieldset>
      </Card>
    </div>
  );
}
