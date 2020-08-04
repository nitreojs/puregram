import { ContextInterface } from '../types';
import { SceneRepository } from '../scene-manager.types';

export interface SceneContextOptions {
  context: ContextInterface;

  repository: SceneRepository;
}

export interface SceneContextEnterOptions {
  /** Logging into a handler without executing it */
  silent?: boolean;

  /** The standard state for the scene */
  state?: Record<string, unknown>;
}

export interface SceneContextLeaveOptions {
  /** Logging into a handler without executing it */
  silent?: boolean;

  /** Cancelled scene */
  cancelled?: boolean;
}

export enum LastAction {
  NONE = 'none',
  ENTER = 'enter',
  LEAVE = 'leave'
}
