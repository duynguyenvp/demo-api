import { Request, Response } from 'express'
import { buildDataLoaders } from '../utils/dataLoader'
import { IUser } from './IUser';

export type Context = {
  token: string | string[] | undefined;
  user: IUser | null,
  error: any | null,
	request: Request
	response: Response
	dataLoaders: ReturnType<typeof buildDataLoaders>
}
