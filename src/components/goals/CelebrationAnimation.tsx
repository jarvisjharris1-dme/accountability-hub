import { useEffect } from 'react';

interface CelebrationAnimationProps {
  show: boolean;
  onComplete?: () => void;
}

export function CelebrationAnimation({ show, onComplete }: CelebrationAnimationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-2xl text-center animate-bounce">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold mb-2">Goal Achieved!</h2>
        <p className="text-muted-foreground">Congratulations on your success!</p>
      </div>
    </div>
  );
}
