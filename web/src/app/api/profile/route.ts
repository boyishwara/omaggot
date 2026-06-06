import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function DELETE() {
  try {
    const supabase = await createClient();
    
    // Get the authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const adminClient = createAdminClient();

    // Delete the user from auth entirely
    const { error: authError } = await adminClient.auth.admin.deleteUser(user.id);
    
    if (authError) throw authError;

    // The user_profiles record might need manual deletion if cascade isn't set up
    await adminClient.from('user_profiles').delete().eq('id', user.id);

    return NextResponse.json({ success: true, message: 'Account deleted successfully' });
  } catch (error: any) {
    console.error('Delete account error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
