import { NextResponse } from 'next/server'
// The client you created in Step 3
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            const forwardedHost = request.headers.get('x-forwarded-host')
            const isLocalEnv = process.env.NODE_ENV === 'development'
            const completePath = `/auth/complete${next && next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`
            if (isLocalEnv) {
                return NextResponse.redirect(`${origin}${completePath}`)
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${completePath}`)
            } else {
                return NextResponse.redirect(`${origin}${completePath}`)
            }
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
