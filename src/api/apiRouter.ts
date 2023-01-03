import http from 'node:http'

export interface ApiRouter {
    route(request: http.IncomingMessage, response: http.ServerResponse): void;
}
