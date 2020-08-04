import {
  StepContext,
  StepSceneHandler
} from '../scenes';

export interface StepContextOptions {
  context: StepContext;

  steps: StepSceneHandler[];
}

export interface StepContextGoOptions {
  /** Logging into a handler without executing it */
  silent?: boolean;
}
