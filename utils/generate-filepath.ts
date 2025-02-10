import { format } from 'date-fns';

export const generateFilepath = ({
  uuid,
  fileType,
  date,
}: {
  uuid: string;
  fileType: string;
  date: Date;
}) => {
  const dateStr = format(date, 'yyyy-MM-dd');
  return {
    inputPath: `uploads/${dateStr}/${uuid}/input.${fileType}`,
    outputFolderPath: `uploads/${dateStr}/${uuid}/`,
  };
};
