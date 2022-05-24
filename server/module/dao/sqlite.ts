import * as Path from 'path';
import { Sequelize } from 'sequelize';
import { cashConfig } from '../../../config';

export const dbClient = new Sequelize({
    dialect: 'sqlite',
    storage: cashConfig.dbAddress,
    // logging: false
});
