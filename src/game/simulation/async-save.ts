import { BACKUP_KEY, decodeSave, SAVE_KEY } from './save';
import type { SaveDocument } from './save';

export interface AsyncSaveStorage {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
}

export async function writeSaveAsync(storage: AsyncSaveStorage, raw: string): Promise<void> {
    decodeSave(raw);
    const previous = await storage.getItem(SAVE_KEY);
    if (previous !== null) {
        try { decodeSave(previous); await storage.setItem(BACKUP_KEY, previous); }
        catch { /* Keep the last valid backup. */ }
    }
    await storage.setItem(SAVE_KEY, raw);
}

export async function readSaveAsync(storage: AsyncSaveStorage): Promise<{ document: SaveDocument | null; recovered: boolean }> {
    const primary = await storage.getItem(SAVE_KEY);
    if (primary === null) {
        const backup = await storage.getItem(BACKUP_KEY);
        return backup === null ? { document: null, recovered: false }
            : { document: decodeSave(backup), recovered: true };
    }
    try { return { document: decodeSave(primary), recovered: false }; }
    catch (error) {
        const backup = await storage.getItem(BACKUP_KEY);
        if (backup !== null) {
            try { return { document: decodeSave(backup), recovered: true }; }
            catch { /* Report the primary failure. */ }
        }
        throw error;
    }
}
