import {Configuration, AuthenticationApi, StatusApi, ProjectApi} from '@/api';

const apiConfig = new Configuration({
        basePath: window.location.origin
});

const statusApi = new StatusApi(apiConfig)
const authenticationApi = new AuthenticationApi(apiConfig)
const projectsApi = new ProjectApi(apiConfig)

export const Api = {
        status: statusApi,
        auth: authenticationApi,
        project: projectsApi
}