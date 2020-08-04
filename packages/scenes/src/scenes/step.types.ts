import { ContextInterface } from '../types';

import {
  SceneContext,
  StepSceneContext
} from '../contexts';

export interface StepContext extends ContextInterface {
  scene: SceneContext & {
    /** Stepping scene control context */
    step: StepSceneContext;
  };
}

export interface StepSceneOptions<T> {
  steps: StepSceneHandler<T>[];

  enterHandler?: StepSceneHandler<T>;

  leaveHandler?: StepSceneHandler<T>;
}

export type StepSceneHandler<T = {}> = (context: StepContext & T) => unknown;
