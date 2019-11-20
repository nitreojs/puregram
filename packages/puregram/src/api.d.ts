import Interfaces from '../typings/interfaces';

declare class API {
  public call(method: string, params: object): Promise<object>;
  
  public getMe(): Promise<Interfaces.IUser>;
}

export = API;
