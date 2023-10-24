import {NextFunction, Request, Response} from "express";

function catchAsync(fn: any) {
    return (req: Request, res: Response, next: NextFunction) => {
        fn(req, res, next).catch(next)
    }
}

export default catchAsync;