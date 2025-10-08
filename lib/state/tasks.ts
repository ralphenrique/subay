import type { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/supabase/types';
import { observable } from '@legendapp/state';
import { syncedSupabase } from '@legendapp/state/sync-plugins/supabase';
import { configureSynced } from '@legendapp/state/sync';
import { observablePersistAsyncStorage } from '@legendapp/state/persist-plugins/async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
type TaskRow = Database['public']['Tables']['tasks']['Row'];

const localTasks$ = observable<Record<string, TaskRow>>({});
let activeTasks$ = localTasks$;
let remoteTasks$: typeof localTasks$ | null = null;
let currentSupabaseClient: SupabaseClient | null = null;

let currentUserId: string | null = null;
let hasLoggedError = false;

const createSyncedTasksObservable = (supabaseClient: SupabaseClient, userId: string): typeof localTasks$ => {
  const customSynced = configureSynced(syncedSupabase, {
    persist: {
      plugin: observablePersistAsyncStorage({
        AsyncStorage,
      }),
    },
    supabase: supabaseClient,
    changesSince: 'last-sync',
    fieldCreatedAt: 'created_at',
    fieldUpdatedAt: 'updated_at',
    // Error handling with console logs
    onError: (error: any) => {
      if (!hasLoggedError) {
        console.error('❌ TaskSync: Sync error occurred:', error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        hasLoggedError = true;
      }
    },

  });

  return observable<Record<string, TaskRow>>(
    customSynced({
      supabase: supabaseClient,
      collection: 'tasks',
      actions: ['read', 'create', 'update', 'delete'],
      realtime: true,
      persist: {
        name: `tasks_${userId}`,
        retrySync: true,
      },
      retry: {
        infinite: true,
      },
    }) as Record<string, TaskRow>
  ) as typeof localTasks$;
};

export function enableTaskSync(supabaseClient: SupabaseClient, userId: string) {
  if (!supabaseClient) {
    return;
  }
  console.log('enableTaskSync called with userId:', userId);
  currentUserId = userId; // to globally track current user ID

  if (!remoteTasks$ || currentSupabaseClient !== supabaseClient) {
    remoteTasks$ = createSyncedTasksObservable(supabaseClient, userId);
    currentSupabaseClient = supabaseClient;

    // Migrate any locally stored tasks into the synced store
    const localTasks = localTasks$.get();
    if (localTasks && typeof localTasks === 'object') {
      const taskCount = Object.keys(localTasks).length;
      if (taskCount > 0) {
        Object.values(localTasks).forEach((task) => {
          const id = task.id ?? uuidv4();
          remoteTasks$![id].assign({
            ...task,
            id,
            owner_id: userId,
          });
        });
        localTasks$.assign({});
      }
    }
  }

  activeTasks$ = remoteTasks$ ?? localTasks$;
}


export function syncTasksNow() {
  if (activeTasks$ === remoteTasks$ && !!remoteTasks$) {
    console.log('syncTasksNow: Forcing sync of tasks');
    // Force a sync by touching the observable
    remoteTasks$.assign({ ...remoteTasks$.get() });
  }
}


export function disableTaskSync() {
  activeTasks$ = localTasks$;
}

const getStore = () => activeTasks$ ?? localTasks$;

export function addTask(taskText: string, ) {
  const store$ = getStore();
  const id = uuidv4();

  store$[id].assign({
    id,
    task: taskText,
    is_done: false,
    owner_id: currentUserId,
  });
}

export function toggleDone(id: string) {
  const store$ = getStore();
  store$[id].is_done.set((prev: boolean) => !prev);
}

export function getTasksArray() {
  const store$ = getStore();
  const tasksObj = store$.get();
  if (!tasksObj || typeof tasksObj !== 'object') {
    return [];
  }
  return Object.values(tasksObj).filter((task: any) => task && task.id);
}

export function isTaskSyncEnabled() {
  return activeTasks$ === remoteTasks$ && !!remoteTasks$;
}