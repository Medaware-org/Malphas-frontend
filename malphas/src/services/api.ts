import {Configuration, StatusApi, ScenesApi, type Middleware, WireApi, CircuitApi} from '@/api';
import type {AjaxConfig, AjaxResponse} from 'rxjs/ajax';

class AuthorizationMiddleware implements Middleware {
        pre(request: AjaxConfig): AjaxConfig {
                request.headers = {
                        ...request.headers
                }
                request.withCredentials = true
                return request
        }

        post(response: AjaxResponse<any>): AjaxResponse<any> {
                return response;
        }
}

const apiConfig = new Configuration({
        basePath: window.location.origin.replace("5173", "8080"), // TODO Change this for prod
        middleware: [new AuthorizationMiddleware()]
});

const statusApi = new StatusApi(apiConfig)
const sceneApi = new ScenesApi(apiConfig)
const wireApi = new WireApi(apiConfig)
const circuitApi = new CircuitApi(apiConfig)

export const Api = {
        status: statusApi,
        scene: sceneApi,
        wire: wireApi,
        circuit: circuitApi
}
