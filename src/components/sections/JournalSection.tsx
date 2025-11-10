import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { JournalEntry } from '@/types';

export const JournalSection: React.FC = () => {
  const [entry, setEntry] = useState('');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const prompts = [
    'What challenge did you overcome today?',
    'How did you show up for yourself or others?',
    'What are you grateful for right now?'
  ];

  useEffect(() => {
    loadEntries();
  }, [user]);

  const loadEntries = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedEntries: JournalEntry[] = (data || []).map(e => ({
        id: e.id,
        date: new Date(e.created_at).toISOString().split('T')[0],
        content: e.content,
        mood: e.mood,
        tags: e.tags || []
      }));

      setEntries(formattedEntries);
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entry.trim() || !user) return;

    try {
      const { error } = await supabase
        .from('journal_entries')
        .insert({
          user_id: user.id,
          content: entry,
          tags: []
        });

      if (error) throw error;

      await loadEntries();
      setEntry('');
      alert('Journal entry saved!');
    } catch (error) {
      console.error('Error saving entry:', error);
      alert('Failed to save entry. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h2 className="text-2xl font-bold text-[#1a2332] mb-4">Daily Journal</h2>
        
        <div className="mb-4 p-4 bg-[#d4a574]/10 rounded-lg">
          <p className="text-sm font-medium text-[#1a2332] mb-2">Today's Prompt:</p>
          <p className="text-gray-700">{prompts[0]}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            placeholder="Write your thoughts here..."
            className="w-full h-40 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#d4a574] focus:border-transparent resize-none"
          />
          <button
            type="submit"
            className="mt-4 w-full bg-[#d4a574] text-white py-3 rounded-lg font-medium hover:bg-[#c49564] transition-colors"
          >
            Save Entry
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-md">
        <h3 className="text-xl font-bold text-[#1a2332] mb-4">Recent Entries</h3>
        {isLoading ? (
          <p className="text-gray-500">Loading entries...</p>
        ) : entries.length === 0 ? (
          <p className="text-gray-500">No entries yet. Start journaling!</p>
        ) : (
          <div className="space-y-3">
            {entries.map((e) => (
              <div key={e.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                <p className="text-sm text-gray-500 mb-1">{e.date}</p>
                <p className="text-gray-700">{e.content.slice(0, 100)}{e.content.length > 100 ? '...' : ''}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
