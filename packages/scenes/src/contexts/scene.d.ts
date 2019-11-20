import { ISessionContext } from '../types';
import {
	ISceneContextOptions,
	ISceneContextEnterOptions,
	ISceneContextLeaveOptions,

	LastAction
} from './scene.types';
import { IScene } from '../scenes';

export default class SceneContext {
	/**
	 * Lazy session for submodules
	 * ```js
	 * ctx.scene.session.moduleFlag = true;
	 * ```
	 */
	public session!: ISessionContext;

	/**
	 * Base namespace for user input
	 *
	 * ```js
	 * ctx.scene.username = myInputText;
	 * ```
	 */
	public state!: Record<string, any>;

	/**
	 * Is the scene canceled, used in leaveHandler()
	 *
	 * ```js
	 * ctx.scene.leave({
	 *   canceled: true,
	 * });
	 * ```
	 */
	public canceled = false;

	public lastAction: LastAction = LastAction.NONE;

	private context: ISceneContextOptions['context'];

	private repository: ISceneContextOptions['repository'];

	/**
	 * Controlled behavior leave
	 */
	private leaved = false;

	public constructor(options: ISceneContextOptions);

	/**
	 * Returns current scene
	 */
	public get current(): IScene | null;

	/**
	 * Enter to scene
	 *
	 * ```js
	 * ctx.scene.enter('signup');
	 * ctx.scene.enter('signup', {
	 *   silent: true,
	 *   state: {
	 *     username: 'Super_Developer',
	 *   },
	 * });
	 * ```
	 */
	public async enter(slug: string, options: ISceneContextEnterOptions = {}): Promise<void>;

	/**
	 * Reenter to current scene
	 *
	 * ```js
	 * ctx.scene.reenter();
	 * ```
	 */
	public async reenter(): Promise<void>;

	/**
	 * Leave from current scene
	 *
	 * ```js
	 * ctx.scene.leave();
	 * ctx.scene.leave({
	 *   silent: true,
	 *   canceled: true,
	 * });
	 * ```
	 */
	public async leave(options: ISceneContextLeaveOptions = {}): Promise<void>;

	/**
	 * Reset state/session
	 */
	public reset(): void;

	/**
	 * Updates session and state is lazy
	 */
	private updateSession(): void;
}