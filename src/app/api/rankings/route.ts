import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get('difficulty') ?? 'hard'; // easy | medium | hard
    const limit = Math.min(Number(searchParams.get('limit') ?? '10'), 50);

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('rankings')
        .select('id, player_name, flag, country, difficulty, time_seconds, time_display, created_at')
        .eq('difficulty', difficulty.toLowerCase())
        .order('time_seconds', { ascending: true })
        .limit(limit);

    if (error) {
        console.error('[rankings API] Supabase error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // reshape to match RankingRow type expected by RankingBoard
    const rows = (data ?? []).map((row, i) => ({
        rank: i + 1,
        flag: row.flag,
        countryName: row.country,
        name: row.player_name,
        diff: row.difficulty.charAt(0).toUpperCase() + row.difficulty.slice(1), // "easy" → "Easy"
        time: row.time_display,
    }));

    return NextResponse.json(rows, {
        headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
    });
}
