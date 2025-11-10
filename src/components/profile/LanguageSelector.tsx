import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Globe } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
];

export function LanguageSelector() {
  const { user } = useAuth();
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchLanguage();
    }
  }, [user]);

  const fetchLanguage = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('preferred_language')
      .eq('user_id', user?.id)
      .single();
    
    if (data?.preferred_language) {
      setLanguage(data.preferred_language);
    }
  };

  const handleLanguageChange = async (newLanguage: string) => {
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ preferred_language: newLanguage })
      .eq('user_id', user?.id);
    
    if (error) {
      toast.error('Failed to update language');
    } else {
      setLanguage(newLanguage);
      toast.success('Language preference updated');
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Language Preference
        </CardTitle>
        <CardDescription>
          Choose your preferred language for SMS notifications and messages
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label>Preferred Language</Label>
          <Select value={language} onValueChange={handleLanguageChange} disabled={loading}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map(lang => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.nativeName} ({lang.name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            SMS verification codes and notifications will be sent in your preferred language
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
