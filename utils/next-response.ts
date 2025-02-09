import { NextResponse } from 'next/server';

const NEXT_RESPONSE_TYPES = ['success', 'unauthorized'] as const;
type NextResponseType = (typeof NEXT_RESPONSE_TYPES)[number];

const nextResponseCode: Record<NextResponseType, number> = {
  success: 200,
  unauthorized: 401,
};

const nextResponseMessage: Record<NextResponseType, string> = {
  success: 'Success',
  unauthorized: 'Unauthorized',
};

export const createNextResponse = (type: NextResponseType) => {
  switch (type) {
    case 'success':
      return NextResponse.json(
        { message: nextResponseMessage[type] },
        { status: nextResponseCode[type] }
      );
    case 'unauthorized':
      return NextResponse.json(
        { error: nextResponseMessage[type] },
        { status: nextResponseCode[type] }
      );

    default:
      return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
  }
};
