import { Tables, TablesInsert, TablesUpdate } from '../supabase/types';

// Task types from Supabase
export type Task = Tables<'tasks'>;
export type TaskInsert = TablesInsert<'tasks'>;
export type TaskUpdate = TablesUpdate<'tasks'>;

// Local task type with additional fields for optimistic updates
export type LocalTask = Task & {
  _isLocal?: boolean; // Flag for locally created items not yet synced
  _isDeleted?: boolean; // Flag for soft deletes
  _isDirty?: boolean; // Flag for items that need to be synced
};