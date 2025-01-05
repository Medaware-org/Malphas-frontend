// tslint:disable
/**
 * Malphas Backend
 * Endpoint documentation for the Malphas Backend
 *
 * The version of the OpenAPI document: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import type { Observable } from 'rxjs';
import type { AjaxResponse } from 'rxjs/ajax';
import { BaseAPI, throwIfNullOrUndefined } from '../runtime';
import type { OperationOpts, HttpHeaders } from '../runtime';
import type {
    CircuitCreationDto,
    CircuitDto,
} from '../models';

export interface PostCircuitRequest {
    circuitCreationDto: CircuitCreationDto;
}

/**
 * no description
 */
export class CircuitApi extends BaseAPI {

    /**
     * Get all circuits
     * Get All Circuits
     */
    listAllCircuits(): Observable<Array<CircuitDto>>
    listAllCircuits(opts?: OperationOpts): Observable<AjaxResponse<Array<CircuitDto>>>
    listAllCircuits(opts?: OperationOpts): Observable<Array<CircuitDto> | AjaxResponse<Array<CircuitDto>>> {
        return this.request<Array<CircuitDto>>({
            url: '/circuit',
            method: 'GET',
        }, opts?.responseOpts);
    };

    /**
     * Create a new circuit
     * Create a new circuit
     */
    postCircuit({ circuitCreationDto }: PostCircuitRequest): Observable<void>
    postCircuit({ circuitCreationDto }: PostCircuitRequest, opts?: OperationOpts): Observable<void | AjaxResponse<void>>
    postCircuit({ circuitCreationDto }: PostCircuitRequest, opts?: OperationOpts): Observable<void | AjaxResponse<void>> {
        throwIfNullOrUndefined(circuitCreationDto, 'circuitCreationDto', 'postCircuit');

        const headers: HttpHeaders = {
            'Content-Type': 'application/json',
        };

        return this.request<void>({
            url: '/circuit',
            method: 'POST',
            headers,
            body: circuitCreationDto,
        }, opts?.responseOpts);
    };

}