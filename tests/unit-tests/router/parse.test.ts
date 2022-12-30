import { PathTemplate, parsePath, buildArguments } from '../../../src/router/parse';

describe('parsePath from router path parser', () => {

    it('should be string and equal to input', () => {
        const api = '/api/users';
        const path = parsePath(api);
        expect(typeof path).toBe('string');
        expect(path).toStrictEqual(api);
    });

    it('should be string and equal to input when the format is broken', () => {
        const brokenApi = '/api/users/{broken/';
        const path = parsePath(brokenApi);
        expect(typeof path).toBe('string');
        expect(path).toStrictEqual(brokenApi);
    });

    it('should be PathTemplate', () => {
        const path = parsePath('/api/users/{userId}');
        expect((path as PathTemplate).pathRx).toBeDefined();
    });

    it('should have names', () => {
        const api = '/api/users/{userId}/{orderId}';
        const rule = parsePath(api) as PathTemplate;
        expect(rule.names).toBeDefined();
        expect(rule.names).toEqual(['userId', 'orderId']);
    });
});

describe('buildArguments from router path parser', () => {

    it('should have arguments', () => {
        const api = '/api/users/{userId}/{orderId}';
        const rule = parsePath(api) as PathTemplate;
        const path = '/api/users/12-345/sd_f876';

        const args = buildArguments(path, rule);

        expect(args).toMatchObject({
            userId: '12-345',
            orderId: 'sd_f876'
        });
    });

    it('should have no arguments for bad path', () => {
        const api = '/api/users/{userId}/{orderId}';
        const rule = parsePath(api) as PathTemplate;
        const badPath = '/api/users';

        const args = buildArguments(badPath, rule);

        expect(args).toMatchObject({});
    });

    it('should have no arguments for an inappropriate path', () => {
        const api = '/api/users/{userId}/{orderId}';
        const rule = parsePath(api) as PathTemplate;
        const otherPath = '/api/users/12-345';

        const args = buildArguments(otherPath, rule);

        expect(args).toMatchObject({});
    });
});
