import { Home, ScanFace, Users, BookOpen, Target } from "lucide-react";
interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}
const tabs = [
  { id: "dashboard", label: "Home", icon: Home },
  { id: "journal", label: "Mirror", icon: ScanFace },
  { id: "circle", label: "Circle", icon: Users },
  { id: "workshop", label: "Workshops", icon: BookOpen },
  { id: "goals", label: "Goals", icon: Target },
];
export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      aria-label="Main navigation"
      className="app-bottom-nav fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-bottom"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-5 h-16 px-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            aria-current={activeTab === id ? "page" : undefined}
            onClick={() => onTabChange(id)}
            className={`min-w-0 flex flex-col items-center justify-center gap-1 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1a2332] ${activeTab === id ? "text-[#8b633c] bg-[#d4a574]/10 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <Icon className="w-6 h-6" aria-hidden="true" />
            <span className="text-xs leading-tight">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
