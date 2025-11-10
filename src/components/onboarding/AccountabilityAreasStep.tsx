import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Briefcase, Dumbbell, Book, Users, DollarSign, Lightbulb, Home } from 'lucide-react';

const AREAS = [
  { id: 'health', label: 'Health & Fitness', icon: Dumbbell },
  { id: 'career', label: 'Career', icon: Briefcase },
  { id: 'relationships', label: 'Relationships', icon: Heart },
  { id: 'education', label: 'Education', icon: Book },
  { id: 'social', label: 'Social Life', icon: Users },
  { id: 'finance', label: 'Finance', icon: DollarSign },
  { id: 'personal', label: 'Personal Growth', icon: Lightbulb },
  { id: 'family', label: 'Family', icon: Home },
];

interface AccountabilityAreasStepProps {
  onNext: (areas: string[]) => void;
  onSkip: () => void;
}

export function AccountabilityAreasStep({ onNext, onSkip }: AccountabilityAreasStepProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleArea = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Choose Your Focus Areas</h2>
        <p className="text-gray-600">Select the areas you want to work on (choose at least one)</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {AREAS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => toggleArea(id)}
            className={`p-4 rounded-lg border-2 transition-all ${
              selected.includes(id)
                ? 'border-[#d4a574] bg-[#d4a574]/10'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Icon className={`w-6 h-6 mb-2 ${selected.includes(id) ? 'text-[#d4a574]' : 'text-gray-600'}`} />
            <p className="text-sm font-medium">{label}</p>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <Button 
          onClick={() => onNext(selected)} 
          className="w-full bg-[#d4a574] hover:bg-[#c49564]"
          disabled={selected.length === 0}
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
