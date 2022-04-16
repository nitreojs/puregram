import { ContextInterface } from '../types'

export interface SceneInterface {
  /** The unique name of the scene */
  slug: string

  /** Enter handler for the scene */
  enterHandler(context: ContextInterface): unknown

  /** Leave handler for the scene */
  leaveHandler(context: ContextInterface): unknown
}
