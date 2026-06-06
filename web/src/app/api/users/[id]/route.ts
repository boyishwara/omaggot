import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { action } = await request.json(); // action = 'approve' or 'reject'

    if (!id || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Check if the requester is a superadmin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', user.id).single();
    if (!profile || profile.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const adminClient = createAdminClient();

    if (action === 'approve') {
      // Approve the user profile
      const { error } = await adminClient
        .from('user_profiles')
        .update({ is_approved: true })
        .eq('id', id);

      if (error) throw error;
      return NextResponse.json({ success: true, message: 'User approved' });

    } else if (action === 'reject') {
      // Delete the user from auth entirely
      const { error: authError } = await adminClient.auth.admin.deleteUser(id);
      
      // The user_profiles record will be cascade deleted if we set up foreign keys, 
      // but since we didn't explicitly setup a cascade delete constraint in schema.sql for user_profiles referencing auth.users,
      // we should delete it manually to be safe.
      await adminClient.from('user_profiles').delete().eq('id', id);

      if (authError) throw authError;
      return NextResponse.json({ success: true, message: 'User rejected and deleted' });
    }

  } catch (error: any) {
    console.error('Approve/Reject error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
