import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { email, password, name, role } = await request.json();

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['user', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto confirm for this app
      user_metadata: { name, role }
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user.id;
    const isApproved = role === 'user'; // Users are auto-approved. Admins need superadmin approval.

    // 2. Insert into user_profiles table
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        name,
        role,
        is_approved: isApproved
      });

    if (profileError) {
      // If profile fails, ideally we should delete the auth user, but for now we return error
      console.error('Profile creation failed:', profileError);
      return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'User registered successfully' });
  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
