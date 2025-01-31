import { format } from 'date-fns';

export const generateFilepath = ({
  uuid,
  fileType,
  date,
  type,
}: {
  uuid: string;
  fileType: string;
  date: Date;
  type: 'input' | 'output';
}) => {
  const dateStr = format(date, 'yyyy-MM-dd');
  if (type === 'input') {
    return `uploads/${dateStr}/${uuid}/input.${fileType}`;
  }

  return `uploads/${dateStr}/${uuid}/`;
};
