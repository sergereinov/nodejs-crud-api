import http from 'node:http'
import { PathTemplate, parsePath, buildArguments } from './parse';

type RouteCallback = (
    request: http.IncomingMessage,
    response: http.ServerResponse,
    args?: any
) => void;

type Route = {
    method: "GET" | "POST" | "PUT" | "DELETE";
    path: string | PathTemplate;
    callback: RouteCallback;
};

class Router {
    private routes: Route[];

    constructor() {
        this.routes = [];
    }

    get(path: string, callback: RouteCallback): this {
        this.routes.push({
            method: "GET",
            path: parsePath(path),
            callback: callback
        })
        return this;
    }
};
