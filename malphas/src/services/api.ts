import {Configuration, AuthenticationApi, StatusApi, ScenesApi, type Middleware} from '@/api';
import type {AjaxConfig, AjaxResponse} from 'rxjs/ajax';
import {useSessionStore} from "@/stores/session.ts";

class AuthorizationMiddleware implements Middleware {
        pre(request: AjaxConfig): AjaxConfig {
                const token = useSessionStore().getToken();
                if (!token)
                        return request;
                request.headers = {
                        ...request.headers,
                        "Authorization": `Bearer ${token}`
                }
                return request
        }

        post(response: AjaxResponse<any>): AjaxResponse<any> {
                return response;
        }
}

const apiConfig = new Configuration({
        basePath: window.location.origin.replace("5173", "1234"), // TODO Change this for prod
        middleware: [new AuthorizationMiddleware()]
});

const statusApi = new StatusApi(apiConfig)
const authenticationApi = new AuthenticationApi(apiConfig)
const sceneApi = new ScenesApi(apiConfig)

export const Api = {
        status: statusApi,
        auth: authenticationApi,
        scene: sceneApi
}
