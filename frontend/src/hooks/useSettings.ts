import { useCallback, useEffect, useState } from "react";
import {
  addSchool,
  addSubject,
  createSettings,
  deleteSettings,
  deleteSettingsField,
  getSettings,
  initializeSettings,
  removeSchool,
  removeSubject,
  replaceSettings,
  setSettingsField,
  SettingsData,
} from "@/lib/settings";

interface UseSettingsOptions {
  autoFetch?: boolean;
}

interface UseSettingsResult {
  settings: SettingsData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<SettingsData | null>;
  initialize: (token: string) => Promise<{ created: boolean; settings: SettingsData }>;
  create: (token: string, payload: Record<string, unknown>) => Promise<SettingsData>;
  replace: (token: string, payload: Record<string, unknown>) => Promise<SettingsData>;
  removeSettings: (token: string) => Promise<void>;
  addSubjectField: (token: string, subject: string) => Promise<SettingsData>;
  removeSubjectField: (token: string, subject: string) => Promise<SettingsData>;
  addSchoolField: (token: string, school: string) => Promise<SettingsData>;
  removeSchoolField: (token: string, school: string) => Promise<SettingsData>;
  setField: (token: string, key: string, value: unknown) => Promise<SettingsData>;
  deleteField: (token: string, key: string) => Promise<SettingsData>;
}

export function useSettings(
  options: UseSettingsOptions = {},
): UseSettingsResult {
  const { autoFetch = true } = options;
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSettings();
      setSettings(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch settings";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const runAndStore = useCallback(
    async (action: () => Promise<SettingsData>) => {
      setError(null);
      try {
        const next = await action();
        setSettings(next);
        return next;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update settings";
        setError(message);
        throw err;
      }
    },
    [],
  );

  const initialize = useCallback(
    async (token: string) => {
      setError(null);
      try {
        const result = await initializeSettings(token);
        setSettings(result.settings);
        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to initialize settings";
        setError(message);
        throw err;
      }
    },
    [],
  );

  const create = useCallback(
    async (token: string, payload: Record<string, unknown>) =>
      runAndStore(() => createSettings(token, payload)),
    [runAndStore],
  );

  const replace = useCallback(
    async (token: string, payload: Record<string, unknown>) =>
      runAndStore(() => replaceSettings(token, payload)),
    [runAndStore],
  );

  const removeSettings = useCallback(async (token: string) => {
    setError(null);
    try {
      await deleteSettings(token);
      setSettings(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete settings";
      setError(message);
      throw err;
    }
  }, []);

  const addSubjectField = useCallback(
    async (token: string, subject: string) =>
      runAndStore(() => addSubject(token, subject)),
    [runAndStore],
  );

  const removeSubjectField = useCallback(
    async (token: string, subject: string) =>
      runAndStore(() => removeSubject(token, subject)),
    [runAndStore],
  );

  const addSchoolField = useCallback(
    async (token: string, school: string) =>
      runAndStore(() => addSchool(token, school)),
    [runAndStore],
  );

  const removeSchoolField = useCallback(
    async (token: string, school: string) =>
      runAndStore(() => removeSchool(token, school)),
    [runAndStore],
  );

  const setField = useCallback(
    async (token: string, key: string, value: unknown) =>
      runAndStore(() => setSettingsField(token, key, value)),
    [runAndStore],
  );

  const deleteField = useCallback(
    async (token: string, key: string) =>
      runAndStore(() => deleteSettingsField(token, key)),
    [runAndStore],
  );

  useEffect(() => {
    if (!autoFetch) {
      setIsLoading(false);
      return;
    }

    void refetch().catch(() => {
      // Error state is already set in refetch.
    });
  }, [autoFetch, refetch]);

  return {
    settings,
    isLoading,
    error,
    refetch,
    initialize,
    create,
    replace,
    removeSettings,
    addSubjectField,
    removeSubjectField,
    addSchoolField,
    removeSchoolField,
    setField,
    deleteField,
  };
}
