'use server';

import { revalidatePath } from 'next/cache';

export async function revalidateUserSession(path: string) {
  revalidatePath(path);
}
