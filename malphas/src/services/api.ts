import {Configuration, AuthenticationApi, StatusApi} from '../api';

const apiConfig = new Configuration({
        basePath: window.location.origin
});

const statusApi = new StatusApi(apiConfig)
const authenticationApi = new AuthenticationApi(apiConfig)

export const Api = {
        status: statusApi,
        auth: authenticationApi,
}