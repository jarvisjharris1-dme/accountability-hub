import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus } from 'lucide-react';

interface SMSTemplate {
  id: string;
  template_key: string;
  language_code: string;
  message_template: string;
  is_rtl: boolean;
  character_encoding: string;
  is_active: boolean;
}

const LANGUAGES = [
  { code: 'en', name: 'English', rtl: false },
  { code: 'es', name: 'Español', rtl: false },
  { code: 'fr', name: 'Français', rtl: false },
  { code: 'de', name: 'Deutsch', rtl: false },
  { code: 'ar', name: 'العربية', rtl: true },
  { code: 'he', name: 'עברית', rtl: true },
  { code: 'zh', name: '中文', rtl: false },
  { code: 'ja', name: '日本語', rtl: false },
  { code: 'ko', name: '한국어', rtl: false },
  { code: 'pt', name: 'Português', rtl: false },
  { code: 'ru', name: 'Русский', rtl: false },
  { code: 'hi', name: 'हिन्दी', rtl: false },
];

export function SMSTemplateEditor() {
  const [templates, setTemplates] = useState<SMSTemplate[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    template_key: 'phone_verification',
    language_code: 'en',
    message_template: '',
    is_rtl: false,
    character_encoding: 'UTF-8',
    is_active: true,
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    const { data, error } = await supabase
      .from('sms_templates')
      .select('*')
      .order('language_code');
    
    if (!error && data) setTemplates(data);
  };

  const handleSave = async () => {
    if (editing) {
      const { error } = await supabase
        .from('sms_templates')
        .update(formData)
        .eq('id', editing);
      
      if (error) {
        toast.error('Failed to update template');
      } else {
        toast.success('Template updated');
        setEditing(null);
        fetchTemplates();
      }
    } else {
      const { error } = await supabase
        .from('sms_templates')
        .insert([formData]);
      
      if (error) {
        toast.error('Failed to create template');
      } else {
        toast.success('Template created');
        fetchTemplates();
      }
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('sms_templates')
      .delete()
      .eq('id', id);
    
    if (!error) {
      toast.success('Template deleted');
      fetchTemplates();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editing ? 'Edit' : 'Create'} SMS Template</CardTitle>
          <CardDescription>
            Use {'{code}'} as placeholder for verification code
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Language</Label>
              <Select value={formData.language_code} onValueChange={(v) => {
                const lang = LANGUAGES.find(l => l.code === v);
                setFormData({...formData, language_code: v, is_rtl: lang?.rtl || false});
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map(lang => (
                    <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Encoding</Label>
              <Select value={formData.character_encoding} onValueChange={(v) => setFormData({...formData, character_encoding: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTF-8">UTF-8</SelectItem>
                  <SelectItem value="UTF-16">UTF-16</SelectItem>
                  <SelectItem value="GSM-7">GSM-7</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Message Template</Label>
            <Textarea
              value={formData.message_template}
              onChange={(e) => setFormData({...formData, message_template: e.target.value})}
              className={formData.is_rtl ? 'text-right' : ''}
              dir={formData.is_rtl ? 'rtl' : 'ltr'}
              rows={3}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
            />
            <Label>Active</Label>
          </div>
          <Button onClick={handleSave}>
            {editing ? 'Update' : 'Create'} Template
          </Button>
          {editing && <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>}
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {templates.map(template => (
          <Card key={template.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">
                      {LANGUAGES.find(l => l.code === template.language_code)?.name}
                    </span>
                    {template.is_rtl && <span className="text-xs bg-blue-100 px-2 py-1 rounded">RTL</span>}
                    {!template.is_active && <span className="text-xs bg-gray-100 px-2 py-1 rounded">Inactive</span>}
                  </div>
                  <p className={`text-sm ${template.is_rtl ? 'text-right' : ''}`} dir={template.is_rtl ? 'rtl' : 'ltr'}>
                    {template.message_template}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => {
                    setFormData(template);
                    setEditing(template.id);
                  }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(template.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
