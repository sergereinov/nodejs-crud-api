import http from 'node:http'
import { PathTemplate, parsePath, buildArguments } from './parse';

/**
 * Route callback type definition
 */
type RouteCallback = (
    request: http.IncomingMessage,
    response: http.ServerResponse,
    args?: object
) => void;

/**
 * Definitions of allowed methods
 */
type RouteMethods = 'GET' | 'POST' | 'PUT' | 'DELETE';

/**
 * A route rule containing a pattern to find and invoke the appropriate callback
 */
type Route = {
    method: RouteMethods;
    path: string | PathTemplate;
    callback: RouteCallback;
};

/**
 * Simple api router
 */
export class Router {
    private routes: Route[];

    constructor() {
        this.routes = [];
    }

    /**
     * Add one Route rule.
     * @param method is one of RouteMethods "GET" | "POST" | "PUT" | "DELETE"
     * @param path is exact api path or parameterized template like `'/api/users/{userId}/{orderId}'`
     * @param callback will called when the path rule matches
     */
    on(method: RouteMethods, path: string, callback: RouteCallback): this {
        this.routes.push({
            method: method,
            path: parsePath(path),
            callback: callback
        })
        return this;
    }

    /**
     * Process incoming request
     * @returns `true` when request was processed or `false` if suitable rule not found
     */
    do(request: http.IncomingMessage, response: http.ServerResponse): boolean {
        const { method, url } = request;
        const { pathname } = new URL(url, `http://localhost`);

        // find suitable route rule
        const route = this.routes.find((r) => {
            if (r.method !== method) {
                return false;
            }            
            if (typeof r.path === 'string') {
                return r.path === pathname;
            } else {
                return r.path.pathRx.test(pathname)
            }
        });

        // if the route rule isn't found
        if (!route) {
            return false; // not found
        }

        // call the route callback with appropriate arguments
        if (typeof route.path === 'string') {
            route.callback(request, response);
        } else {
            const args = buildArguments(pathname, route.path);
            route.callback(request, response, args);
        }

        // request processed
        return true;
    }
};
