import { IProcessor } from "../interfaces/iprocessor";
import { Command } from "../models/command";

export class Utils {
    static isDefined = (obj: any):  boolean => obj !== undefined && obj !== null;
}