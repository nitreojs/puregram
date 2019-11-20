import { IStepContext, StepSceneHandler } from '../scenes/step.types';

export interface IStepContextOptions {
	context: IStepContext;
	steps: StepSceneHandler[];
}
