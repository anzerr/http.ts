
import {METADATA} from './enum';

/* tslint:disable:variable-name */
const Controller = (path?: string) => {
	return (target: any) => {
		Reflect.defineMetadata(METADATA.PATH, path || '', target);
	};
};

export default Controller;
