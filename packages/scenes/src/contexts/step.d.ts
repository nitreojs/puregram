import { IStepContextOptions } from './step.types';
import { StepSceneHandler } from '../scenes/step.types';
import { LastAction } from './scene.types';

export default class StepSceneContext {
	private context: IStepContextOptions['context'];

	private steps: IStepContextOptions['steps'];

	private stepChanged = false;

	public constructor(options: IStepContextOptions);

	/**
	 * The first enter to the handler
	 */
	public get firstTime(): boolean;

	/**
	 * Returns current stepId
	 */
	public get stepId(): number;

	/**
	 * Sets current stepId
	 */
	public set stepId(stepId: number): void;

	/**
	 * Returns current handler
	 */
	public get current(): StepSceneHandler<{}> | null;

	/**
	 * Reenter current step handler
	 *
	 * ```js
	 * ctx.scene.step.reenter();
	 * ```
	 */
	public async reenter(): Promise<void>;

	/**
	 * Move to the next handler
	 *
	 * ```js
	 * ctx.scene.step.next();
	 * ctx.scene.step.next({
	 *   silent: true,
	 * });
	 * ```
	 */
	public async next({ silent = false } = {}): Promise<void>;

	/**
	 * Move to the previous handler
	 *
	 * ```js
	 * ctx.scene.step.previous();
	 * ctx.scene.step.previous({
	 *   silent: true,
	 * });
	 * ```
	 */
	public async previous({ silent = false } = {}): Promise<void>;
}