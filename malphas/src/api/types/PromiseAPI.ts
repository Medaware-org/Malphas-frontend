import { ResponseContext, RequestContext, HttpFile, HttpInfo } from '../http/http';
import { Configuration} from '../configuration'

import { ObservableDefaultApi } from './ObservableAPI';

import { DefaultApiRequestFactory, DefaultApiResponseProcessor} from "../apis/DefaultApi";
export class PromiseDefaultApi {
    private api: ObservableDefaultApi

    public constructor(
        configuration: Configuration,
        requestFactory?: DefaultApiRequestFactory,
        responseProcessor?: DefaultApiResponseProcessor
    ) {
        this.api = new ObservableDefaultApi(configuration, requestFactory, responseProcessor);
    }

    /**
     * Status
     * Status
     */
    public rootGetWithHttpInfo(_options?: Configuration): Promise<HttpInfo<string>> {
        const result = this.api.rootGetWithHttpInfo(_options);
        return result.toPromise();
    }

    /**
     * Status
     * Status
     */
    public rootGet(_options?: Configuration): Promise<string> {
        const result = this.api.rootGet(_options);
        return result.toPromise();
    }


}



