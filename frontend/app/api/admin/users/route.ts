import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase-admin';
import { supabase } from '../../../lib/supabase'; // Client for auth check (or use headers)
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    // 1. Verify the requester is a Super Admin
    // We need to get the session from the request headers or cookies
    // Since we are in an API route, we can't easily use the client-side supabase.auth.getSession()
    // We'll expect the Authorization header with the user's JWT
    
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check role in profiles
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('system_role')
      .eq('id', user.id)
      .single();

    if (profile?.system_role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden: Super Admin access required' }, { status: 403 });
    }

    // 2. Parse body
    const { email, password, system_role, role, fullName } = await request.json();

    if (!email || !password || !system_role || !role || !fullName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 3. Create User
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName }
    });

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    if (!newUser.user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    // 4. Create/Update Profile with Role
    // The trigger might have created a profile already, so we upsert
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: newUser.user.id,
        email: email,
        full_name: fullName,
        system_role: system_role,
        role: role,
        slug: fullName.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 7)
      });

    if (profileError) {
      // Rollback user creation if profile fails? 
      // For now, just report error.
      return NextResponse.json({ error: 'User created but profile update failed: ' + profileError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: newUser.user });

  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
