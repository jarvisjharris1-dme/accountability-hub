import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, LogIn, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function AccountDeletion() {
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState('');
  const [deleted, setDeleted] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUserId(data.session?.user.id ?? null);
      setEmail(data.session?.user.email ?? '');
      setLoading(false);
    };
    void loadSession();
  }, []);

  const handleDelete = async () => {
    if (!userId || confirmText !== 'DELETE MY ACCOUNT') return;

    try {
      setDeleting(true);
      setError('');

      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) throw profileError;

      await supabase.auth.signOut();
      setDeleted(true);
      setUserId(null);
    } catch (err: any) {
      setError(err?.message || 'We could not delete your account. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle>Delete your Accountable account</CardTitle>
            <CardDescription>
              This page lets Accountable users permanently delete their account and associated app data from the web.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <p className="text-sm text-slate-600">Checking your Accountable session…</p>
            ) : deleted ? (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="h-5 w-5" />
                  Account deletion completed
                </div>
                <p className="mt-2 text-sm">Your Accountable account deletion request has been processed and you have been signed out.</p>
              </div>
            ) : !userId ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <p className="text-sm text-slate-700">
                    For your security, sign in to the Accountable web app with the account you want to delete, then return to this page.
                  </p>
                </div>
                <Button asChild>
                  <Link to="/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign in to Accountable
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
                  <div className="flex items-center gap-2 font-semibold">
                    <AlertTriangle className="h-5 w-5" />
                    This action is permanent
                  </div>
                  <p className="mt-2 text-sm">
                    Deleting your account removes your Accountable profile and associated data that we are not legally required to retain.
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-700">Signed in as</p>
                  <p className="mt-1 text-sm text-slate-600">{email}</p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Type DELETE MY ACCOUNT to confirm
                  </label>
                  <Input
                    value={confirmText}
                    onChange={(event) => setConfirmText(event.target.value)}
                    placeholder="DELETE MY ACCOUNT"
                  />
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <Button
                  variant="destructive"
                  disabled={confirmText !== 'DELETE MY ACCOUNT' || deleting}
                  onClick={handleDelete}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {deleting ? 'Deleting account…' : 'Permanently delete my account'}
                </Button>
              </div>
            )}

            <div className="border-t pt-5 text-xs leading-5 text-slate-500">
              If Accountable must retain limited information for security, fraud prevention, legal, or regulatory reasons, that retention will be described in the Accountable Privacy Policy.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
