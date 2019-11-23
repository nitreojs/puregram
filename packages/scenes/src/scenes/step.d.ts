import { MessageContext, CallbackQuery } from '../../../puregram';

import IScene from './scene';

import { StepSceneContext } from '../contexts';
import { LastAction } from '../contexts/scene.types';
import { StepSceneHandler, IStepContext } from './step.types';

interface IStepSceneOptions<T> {
	steps: StepSceneHandler<T>[];
	enterHandler?: StepSceneHandler<T>;
	leaveHandler?: StepSceneHandler<T>;
}

export default class StepScene<T = MessageContext | CallbackQuery> implements IScene {
	public slug: string;

	private steps: StepSceneHandler<T>[];

	private onEnterHandler: IStepSceneOptions<T>['enterHandler'];

	private onLeaveHandler: IStepSceneOptions<T>['leaveHandler'];

	public constructor(slug: string, rawOptions: IStepSceneOptions<T> | StepSceneHandler<T>[]);

	public async enterHandler(context: IStepContext): Promise<void>;

	public leaveHandler(context: IStepContext): Promise<void>;
}