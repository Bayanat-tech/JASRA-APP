import {JS_Uploadfilesdltslms} from '../entities/JS_Uploaded_files_dlts.entity';
import { getRepository } from '../../database/connection';

export class Files_dltslms{

    private static getFiles_dltslmsRepo(){
        return getRepository(JS_Uploadfilesdltslms);
    }

    static async insertFiles_dltslms(FilesdltslmsData : Partial<JS_Uploadfilesdltslms>): Promise <JS_Uploadfilesdltslms>{
        const repository = this.getFiles_dltslmsRepo();

        const Files_lmsins=repository.create({
            ...FilesdltslmsData
        });

        return await repository.save(Files_lmsins);
    }
};