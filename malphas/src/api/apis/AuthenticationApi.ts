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
    CredentialsDto,
    TokenDto,
} from '../models';

export interface LoginRequest {
    credentialsDto: CredentialsDto;
}

export interface RegisterRequest {
    credentialsDto: CredentialsDto;
}

/**
 * no description
 */
export class AuthenticationApi extends BaseAPI {

    /**
     * Attempt to log in with the given credentials
     * Login
     */
    login({ credentialsDto }: LoginRequest): Observable<TokenDto>
    login({ credentialsDto }: LoginRequest, opts?: OperationOpts): Observable<AjaxResponse<TokenDto>>
    login({ credentialsDto }: LoginRequest, opts?: OperationOpts): Observable<TokenDto | AjaxResponse<TokenDto>> {
        throwIfNullOrUndefined(credentialsDto, 'credentialsDto', 'login');

        const headers: HttpHeaders = {
            'Content-Type': 'application/json',
        };

        return this.request<TokenDto>({
            url: '/login',
            method: 'POST',
            headers,
            body: credentialsDto,
        }, opts?.responseOpts);
    };

    /**
     * Invalidate the current session
     * Log out
     */
    logout(): Observable<void>
    logout(opts?: OperationOpts): Observable<void | AjaxResponse<void>>
    logout(opts?: OperationOpts): Observable<void | AjaxResponse<void>> {
        return this.request<void>({
            url: '/logout',
            method: 'POST',
        }, opts?.responseOpts);
    };

    /**
     * Register a new user
     * register
     */
    register({ credentialsDto }: RegisterRequest): Observable<void>
    register({ credentialsDto }: RegisterRequest, opts?: OperationOpts): Observable<void | AjaxResponse<void>>
    register({ credentialsDto }: RegisterRequest, opts?: OperationOpts): Observable<void | AjaxResponse<void>> {
        throwIfNullOrUndefined(credentialsDto, 'credentialsDto', 'register');

        const headers: HttpHeaders = {
            'Content-Type': 'application/json',
        };

        return this.request<void>({
            url: '/register',
            method: 'POST',
            headers,
            body: credentialsDto,
        }, opts?.responseOpts);
    };

}
