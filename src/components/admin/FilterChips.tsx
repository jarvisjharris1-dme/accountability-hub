import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { format } from 'date-fns';

interface FilterChip {
  label: string;
  value: string;
  onRemove: () => void;
}

interface FilterChipsProps {
  chips: FilterChip[];
}

export const FilterChips: React.FC<FilterChipsProps> = ({ chips }) => {
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 p-4 bg-muted/30 rounded-lg">
      <span className="text-sm font-medium text-muted-foreground">Active Filters:</span>
      {chips.map((chip, index) => (
        <Badge key={index} variant="secondary" className="gap-1 pr-1">
          <span className="text-xs">{chip.label}: {chip.value}</span>
          <button
            onClick={chip.onRemove}
            className="ml-1 hover:bg-background/50 rounded-full p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
    </div>
  );
};

export const createFilterChips = (
  searchTerm: string,
  statusFilter: string,
  verificationFilter: string,
  registrationDateFrom: Date | undefined,
  registrationDateTo: Date | undefined,
  lastLoginDateFrom: Date | undefined,
  lastLoginDateTo: Date | undefined,
  handlers: {
    onClearSearch: () => void;
    onClearStatus: () => void;
    onClearVerification: () => void;
    onClearRegFrom: () => void;
    onClearRegTo: () => void;
    onClearLoginFrom: () => void;
    onClearLoginTo: () => void;
  }
): FilterChip[] => {
  const chips: FilterChip[] = [];

  if (searchTerm) {
    chips.push({ label: 'Search', value: searchTerm, onRemove: handlers.onClearSearch });
  }
  if (statusFilter !== 'all') {
    chips.push({ label: 'Status', value: statusFilter, onRemove: handlers.onClearStatus });
  }
  if (verificationFilter !== 'all') {
    chips.push({ label: 'Email', value: verificationFilter, onRemove: handlers.onClearVerification });
  }
  if (registrationDateFrom) {
    chips.push({ label: 'Reg. From', value: format(registrationDateFrom, 'PP'), onRemove: handlers.onClearRegFrom });
  }
  if (registrationDateTo) {
    chips.push({ label: 'Reg. To', value: format(registrationDateTo, 'PP'), onRemove: handlers.onClearRegTo });
  }
  if (lastLoginDateFrom) {
    chips.push({ label: 'Login From', value: format(lastLoginDateFrom, 'PP'), onRemove: handlers.onClearLoginFrom });
  }
  if (lastLoginDateTo) {
    chips.push({ label: 'Login To', value: format(lastLoginDateTo, 'PP'), onRemove: handlers.onClearLoginTo });
  }

  return chips;
};
