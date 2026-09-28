-- Accountable 1.0: complete account deletion
-- The existing Profile UI deletes the authenticated user's public.profiles row.
-- This trigger completes the deletion by removing the matching auth.users row.
-- Any FK/cascade failure rolls the transaction back so we do not leave a half-deleted account.

create or replace function public.delete_auth_user_when_profile_deleted()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  delete from auth.users where id = old.id;
  return old;
end;
$$;

revoke all on function public.delete_auth_user_when_profile_deleted() from public;
revoke all on function public.delete_auth_user_when_profile_deleted() from anon;
revoke all on function public.delete_auth_user_when_profile_deleted() from authenticated;

drop trigger if exists delete_auth_user_after_profile_delete on public.profiles;

create trigger delete_auth_user_after_profile_delete
after delete on public.profiles
for each row
execute function public.delete_auth_user_when_profile_deleted();
