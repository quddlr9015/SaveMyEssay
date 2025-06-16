import { NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/utils/api';

export async function GET() {
    try {
        const response = await fetch(API_ENDPOINTS.AUTH.CHECK, {
            credentials: 'include',
        });

        if (response.ok) {
            return NextResponse.json({ authenticated: true });
        } else {
            return NextResponse.json(
                { authenticated: false },
                { status: 401 }
            );
        }
    } catch (error) {
        return NextResponse.json(
            { authenticated: false },
            { status: 500 }
        );
    }
} 