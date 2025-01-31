import { ANALYZE_IMAGE_RESPONSE_SCHEMA, Rect } from '@/types/rectangle';
import { notifications } from '@mantine/notifications';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';

type Variables = {
  imageUrl: string;
};

type Response = Rect[][];

export const useAnalyzeImage = (options: UseMutationOptions<Response, Error, Variables>) =>
  useMutation<Response, Error, Variables>({
    mutationFn: async (args) => {
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: args.imageUrl,
        }),
      });

      const data = await response.json();
      const parsed = ANALYZE_IMAGE_RESPONSE_SCHEMA.parse(data);
      return parsed.rectangles.map((page) => {
        return page.map((r) => ({ ...r, id: crypto.randomUUID(), source: 'server' }));
      });
    },
    onError: (error) => {
      console.error('Error in useAnalyzeImage', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to analyze image. Please try again.',
        color: 'red',
      });
    },
    ...options,
  });
