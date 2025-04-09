interface IResponse {
  success: boolean,
  message?: string,
  data: any
}

export type ErrorResponse = IResponse & { 
  error_code: number;
}

export const createResponse = (
  data: IResponse["data"],
  message?: string,
): IResponse => {
  return {data, message, success: true}
}