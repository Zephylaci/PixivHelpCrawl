import './model/Images';
import './model/Tags';
import './model/Author';
import './model/Ranking';
import { dbClient } from './sqlite';

// TODO: 记得后面要改模式
// { alter: true }
const dbControl = dbClient; //.sync({ force: true });

export async function getDbControl() {
    await dbControl;
    return dbControl;
}
