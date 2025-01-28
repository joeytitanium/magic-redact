import { MergeDeep } from 'type-fest';
import { AiModel } from './ai-model';
import { Database as DatabaseGenerated } from './database-generated';

export type { Json } from './database-generated';

// Override the type for a specific column in a view:
export type Database = MergeDeep<
  DatabaseGenerated,
  {
    public: {
      Tables: {
        documents: {
          Row: {
            ai_model: AiModel;
          };
          Insert: {
            ai_model?: AiModel;
          };
          Update: {
            ai_model?: AiModel;
          };
        };
      };
    };
  }
>;

export type DocumentRecord = Database['public']['Tables']['documents']['Row'];
export type DocumentInsert = Database['public']['Tables']['documents']['Insert'];
