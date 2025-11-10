import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Search, Calendar as CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';

interface UserFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  verificationFilter: string;
  onVerificationChange: (value: string) => void;
  registrationDateFrom: Date | undefined;
  registrationDateTo: Date | undefined;
  onRegistrationDateFromChange: (date: Date | undefined) => void;
  onRegistrationDateToChange: (date: Date | undefined) => void;
  lastLoginDateFrom: Date | undefined;
  lastLoginDateTo: Date | undefined;
  onLastLoginDateFromChange: (date: Date | undefined) => void;
  onLastLoginDateToChange: (date: Date | undefined) => void;
  onClearFilters: () => void;
}

export const UserFilters: React.FC<UserFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  verificationFilter,
  onVerificationChange,
  registrationDateFrom,
  registrationDateTo,
  onRegistrationDateFromChange,
  onRegistrationDateToChange,
  lastLoginDateFrom,
  lastLoginDateTo,
  onLastLoginDateFromChange,
  onLastLoginDateToChange,
  onClearFilters,
}) => {
  return (
    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm" onClick={onClearFilters}>
          <X className="h-4 w-4 mr-2" />
          Clear All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="Account Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>

        <Select value={verificationFilter} onValueChange={onVerificationChange}>
          <SelectTrigger>
            <SelectValue placeholder="Email Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Emails</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="unverified">Unverified</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {registrationDateFrom ? format(registrationDateFrom, 'PP') : 'Reg. From'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={registrationDateFrom} onSelect={onRegistrationDateFromChange} />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {registrationDateTo ? format(registrationDateTo, 'PP') : 'Reg. To'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={registrationDateTo} onSelect={onRegistrationDateToChange} />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
