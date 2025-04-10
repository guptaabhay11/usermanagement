import bodyParser from "body-parser";
import cors from "cors";
import express, { type Express, type Request, type Response } from "express";
import helmet from "helmet";
import http from "http";



import errorHandler from "./app/common/middleware/error-handler.middleware";
import {initDB} from "./app/common/services/database.services";
import { initPassport } from "./app/common/services/passport-jwt.service";
import routers from "./app/routes";
import { type IUser } from "./app/user/user.dto";
require('dotenv').config()

declare global {
    namespace Express {
      interface User extends Omit<IUser, "password"> { }
      interface Request {
        user?: User;
      }
    }
  }
  const port = Number(process.env.PORT) ?? 5000;

const app: Express = express();

app.use(cors())
app.use(helmet())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());

const initApp = async (): Promise<void> => {
    
    await initDB();
    
  
    
    initPassport();
  
    
    app.use("/api", routers);
  
    app.get("/", (req: Request, res: Response) => {
      res.send({ status: "ok" });
    });
  
    
    app.use(errorHandler);
    http.createServer(app).listen(port, () => {
      console.log("Server is runnuing on port", port);
    });
  };
  
  void initApp();
  