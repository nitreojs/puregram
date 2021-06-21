export interface ContextData {
  /** Context name */
  name: string;
  /** Context description */
  description?: string;
  /** Context payload type, extended to `Interfaces.<payload>` */
  payload: string;
  /** Context `updateType` */
  updateType: string;
  /** `true` if might have custom `updateType` */
  hasCustomType?: boolean;
  /** `true` if `hasCustomType` is `true` and `type` must be required */
  isCustomTypeRequired?: boolean;
  /** `true` if `updateId` is required */
  isUpdateIdRequired?: boolean;

  /** Context getters */
  getters?: string[];
  /** Context methods */
  methods?: string[];

  /** Fields that will be used in `inspectable` `serialize` call */
  fields?: string[];
}

export interface Getter {
  /** Getter description */
  description?: string;
  /** Getter name */
  name: string;
  /** Getter return type */
  returnType?: string;
  /** Getter code */
  code?: string;
  /** `true` if this is a function but is actually a getter */
  isFunctionGetter?: boolean;
  /** Function-getter arguments */
  arguments?: string[];
  /** `true` if this function-getter is an overload and does not have `code` */
  isOverload?: boolean;
}

export interface Method { }
