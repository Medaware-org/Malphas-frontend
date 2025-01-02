import { ResponseContext, RequestContext, HttpFile, HttpInfo } from '../http/http';
import { Configuration} from '../configuration'


import { ObservableDefaultApi } from "./ObservableAPI";
import { DefaultApiRequestFactory, DefaultApiResponseProcessor} from "../apis/DefaultApi";

export interface DefaultApiRootGetRequest {
}

export class ObjectDefaultApi {
    private api: ObservableDefaultApi

    public constructor(configuration: Configuration, requestFactory?: DefaultApiRequestFactory, responseProcessor?: DefaultApiResponseProcessor) {
        this.api = new ObservableDefaultApi(configuration, requestFactory, responseProcessor);
    }

    /**
     * Status
     * Status
     * @param param the request object
     */
    public rootGetWithHttpInfo(param: DefaultApiRootGetRequest = {}, options?: Configuration): Promise<HttpInfo<string>> {
        return this.api.rootGetWithHttpInfo( options).toPromise();
    }

    /**
     * Status
     * Status
     * @param param the request object
     */
    public rootGet(param: DefaultApiRootGetRequest = {}, options?: Configuration): Promise<string> {
        return this.api.rootGet( options).toPromise();
    }

}
