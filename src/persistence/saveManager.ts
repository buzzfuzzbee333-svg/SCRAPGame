import type { MetaState } from '../types/state';

export interface MetaStateStoreAdapter {
  read(): Promise<MetaState | null>;
  write(state: MetaState): Promise<void>;
}

export class MemoryMetaStateAdapter implements MetaStateStoreAdapter {
  private stored: MetaState | null = null;

  async read(): Promise<MetaState | null> {
    return this.stored;
  }

  async write(state: MetaState): Promise<void> {
    this.stored = state;
  }
}

export class SaveManager {
  constructor(private readonly adapter: MetaStateStoreAdapter) {}

  async loadMetaState(): Promise<MetaState | null> {
    return this.adapter.read();
  }

  async persistMetaState(state: MetaState): Promise<void> {
    await this.adapter.write(state);
  }
}
