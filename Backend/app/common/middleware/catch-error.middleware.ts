import expressAsyncHandler from "express-async-handler"
import {type Response, type Request, type NextFunction } from "express"
import {validationResult} from "express-validator"
import createHttpError from "http-errors"
export const catchError = expressAsyncHandler(
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);  //validate the  request
        const isError = errors.isEmpty();

        if(!isError){
            const data = {errors: errors.array()};
            throw createHttpError(400, {  //creating an http error for better response
                message: "validation error!",
                data,
            });
        }else{
            next();
        }
    }
)