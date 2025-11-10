import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Calendar } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

interface MessageSearchBarProps {
  onSearch: (query: string, startDate?: Date, endDate?: Date) => void;
  onClear: () => void;
}

export function MessageSearchBar({ onSearch, onClear }: MessageSearchBarProps) {
  const [query, setQuery] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [showDateFilter, setShowDateFilter] = useState(false);

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query.trim(), startDate, endDate);
    }
  };

  const handleClear = () => {
    setQuery('');
    setStartDate(undefined);
    setEndDate(undefined);
    setShowDateFilter(false);
    onClear();
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search messages..."
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1"
        />
        <Button onClick={handleSearch} size="icon" variant="default">
          <Search className="w-4 h-4" />
        </Button>
        <Button onClick={() => setShowDateFilter(!showDateFilter)} size="icon" variant="outline">
          <Calendar className="w-4 h-4" />
        </Button>
        {(query || startDate || endDate) && (
          <Button onClick={handleClear} size="icon" variant="ghost">
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {showDateFilter && (
        <div className="flex gap-2 items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                {startDate ? startDate.toLocaleDateString() : 'Start Date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <CalendarComponent mode="single" selected={startDate} onSelect={setStartDate} />
            </PopoverContent>
          </Popover>
          <span className="text-sm text-gray-500">to</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                {endDate ? endDate.toLocaleDateString() : 'End Date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <CalendarComponent mode="single" selected={endDate} onSelect={setEndDate} />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
}
