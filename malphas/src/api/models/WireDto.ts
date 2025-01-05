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

import type {
    Bool,
} from './';

/**
 * @export
 * @interface WireDto
 */
export interface WireDto {
    /**
     * @type {string}
     * @memberof WireDto
     */
    id: string;
    /**
     * @type {string}
     * @memberof WireDto
     */
    source_circuit: string;
    /**
     * @type {string}
     * @memberof WireDto
     */
    target_circuit: string;
    /**
     * @type {Bool}
     * @memberof WireDto
     */
    init_signal: Bool;
    /**
     * @type {number}
     * @memberof WireDto
     */
    amount_input: number;
    /**
     * @type {number}
     * @memberof WireDto
     */
    amount_output: number;
    /**
     * @type {string}
     * @memberof WireDto
     */
    location: string;
}
