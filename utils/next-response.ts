import { NextResponse } from 'next/server';

type ApiResponse =
  | { type: '200-success' }
  | { type: '401-unauthorized' }
  | { type: '400-bad-request'; errorMessage: string };
type ApiResponseType = ApiResponse['type'];

const nextResponseCode: Record<ApiResponseType, number> = {
  '400-bad-request': 400,
  '200-success': 200,
  '401-unauthorized': 401,
};

const nextResponseMessage: Record<ApiResponseType, string> = {
  '400-bad-request': 'Bad Request',
  '200-success': 'Success',
  '401-unauthorized': 'Unauthorized',
};

export const createNextResponse = (response: ApiResponse) => {
  if (response.type === '200-success') {
    return NextResponse.json(
      { message: nextResponseMessage[response.type] },
      { status: nextResponseCode[response.type] }
    );
  }

  if (response.type === '400-bad-request') {
    return NextResponse.json(
      { error: nextResponseMessage[response.type], message: response.errorMessage },
      { status: nextResponseCode[response.type] }
    );
  }

  return NextResponse.json(
    { error: nextResponseMessage[response.type] },
    { status: nextResponseCode[response.type] }
  );
};
