import { supabase } from '@/lib/supabase';

export async function checkAndAwardAchievements(userId: string) {
  try {
    // Get user stats
    const [goalsResult, streakResult, journalResult] = await Promise.all([
      supabase.from('goals').select('id', { count: 'exact', head: true })
        .eq('user_id', userId).eq('status', 'completed'),
      supabase.from('user_streaks').select('current_streak').eq('user_id', userId).single(),
      supabase.from('journal_entries').select('id', { count: 'exact', head: true }).eq('user_id', userId)
    ]);

    const goalsCompleted = goalsResult.count || 0;
    const currentStreak = streakResult.data?.current_streak || 0;
    const journalEntries = journalResult.count || 0;

    // Get all achievements
    const { data: achievements } = await supabase.from('achievements').select('*');
    if (!achievements) return;

    // Check each achievement
    for (const achievement of achievements) {
      let earned = false;

      if (achievement.requirement_type === 'goals_completed') {
        earned = goalsCompleted >= achievement.requirement_value;
      } else if (achievement.requirement_type === 'streak_days') {
        earned = currentStreak >= achievement.requirement_value;
      } else if (achievement.requirement_type === 'journal_entries') {
        earned = journalEntries >= achievement.requirement_value;
      }

      if (earned) {
        await supabase.from('user_achievements')
          .upsert({ user_id: userId, achievement_id: achievement.id }, { onConflict: 'user_id,achievement_id' });
      }
    }
  } catch (error) {
    console.error('Error checking achievements:', error);
  }
}
