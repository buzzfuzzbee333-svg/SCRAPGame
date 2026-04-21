export type EventHandler<T = unknown> = (payload: T) => void;

export class EventBus {
  private readonly handlers = new Map<string, Set<EventHandler>>();

  on<T = unknown>(eventName: string, handler: EventHandler<T>): void {
    const existing = this.handlers.get(eventName) ?? new Set<EventHandler>();
    existing.add(handler as EventHandler);
    this.handlers.set(eventName, existing);
  }

  off<T = unknown>(eventName: string, handler: EventHandler<T>): void {
    const existing = this.handlers.get(eventName);
    if (!existing) {
      return;
    }
    existing.delete(handler as EventHandler);
    if (existing.size === 0) {
      this.handlers.delete(eventName);
    }
  }

  emit<T = unknown>(eventName: string, payload: T): void {
    const existing = this.handlers.get(eventName);
    if (!existing) {
      return;
    }
    for (const handler of existing) {
      handler(payload);
    }
  }
}
