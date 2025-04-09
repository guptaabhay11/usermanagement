import {type BaseSchema } from "../common/dto/base.dto";

export interface IAdmin extends BaseSchema {
    name: string;
    email: string;
    password: string;
}