/**
 * Object type contains prepared RegExp path to parse arguments values.
 * 
 * `pathRx` is built around a URL path rule like `'/api/users/{userId}/{orderId}'`.
 * And `pathRx` is ready to match URL paths like `'/api/users/12-3242/fedsf22'`
 * to extract values for corresponding `names`.
 */
export type PathTemplate = {
    pathRx: RegExp;
    names: string[];
};

/**
 * Pattern for variable names like `'{name1}'`, `'{userId}'`, etc.
 */
const nameRx = new RegExp('\{[a-zA-Z0-9_]+\}', 'g');

/**
 * Prepare route path template
 * or return original path if there are no variables to parse.
 * 
 * The input path should be like `'/api/users/{userId}/{orderId}'`.
 */
export const parsePath = (path: string): string | PathTemplate => {
    if (path.indexOf('{') < 0) {
        return path;
    }

    const names = path.match(nameRx)?.map((s) => s.slice(1, -1));
    if (!names) {
        return path;
    }

    const pathRx = new RegExp('^' + path.replace(nameRx, '([a-zA-Z0-9_\-]+)') + '$');

    return {
        pathRx: pathRx,
        names: names
    };
}

/**
 * Build path arguments object based on PathTemplate.
 * 
 * For a previously parsed route rule such as `'/api/users/{userId}/{orderId}'`,
 * the input path should look like `'/api/users/12-3242/fedsf22'`.
 * 
 * Then an object like `{ userId: '12-3242', orderId: 'fedsf22' }` will be returned
 */
export const buildArguments = (path: string, tpl: PathTemplate): object => {
    const values = path.match(tpl.pathRx)?.slice(1);
    if (!values || !tpl.names || values.length !== tpl.names.length) {
        return {};
    }

    const obj = tpl.names.reduce((acc, cur, i) => {
        acc[cur] = values[i];
        return acc;
    }, {});

    return obj;
}
