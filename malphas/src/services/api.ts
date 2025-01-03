import {Configuration, AuthenticationApi, StatusApi, ProjectApi, type Middleware} from '@/api';
import type {AjaxConfig, AjaxResponse} from 'rxjs/ajax';
import {retrieveToken} from "@/services/tokenService.ts";

const apiConfig = new Configuration({
        basePath: window.location.origin.replace("5173", "1234")
});

class AuthorizationMiddleware implements Middleware {
        pre(request: AjaxConfig): AjaxConfig {
                const token = retrieveToken()
                if (!token)
                        return request;
                request.headers = {
                        ...request.headers,
                        "Authorization": `Bearer ${token}`
                }
                return request
        }

        post(response: AjaxResponse<any>): AjaxResponse<any> {
                return response
        }
}

const middleware = new AuthorizationMiddleware()
const statusApi = new StatusApi(apiConfig).withMiddleware([middleware])
const authenticationApi = new AuthenticationApi(apiConfig).withMiddleware([middleware])
const projectsApi = new ProjectApi(apiConfig).withMiddleware([middleware])

export const Api = {
        status: statusApi,
        auth: authenticationApi,
        project: projectsApi
}
