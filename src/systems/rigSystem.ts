import type { RigRunState } from '../types/state';

export class RigSystem {
  reduceIntegrity(rig: RigRunState, incomingDamage: number): RigRunState {
    const adjustedDamage = Math.max(1, incomingDamage - rig.defense);
    const remainingIntegrity = Math.max(0, rig.currentIntegrity - adjustedDamage);

    return {
      ...rig,
      currentIntegrity: remainingIntegrity,
      isOverrun: remainingIntegrity === 0,
    };
  }
}
