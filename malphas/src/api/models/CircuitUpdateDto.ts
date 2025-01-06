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

/**
 * @export
 * @interface CircuitUpdateDto
 */
export interface CircuitUpdateDto {
    /**
     * @type {number}
     * @memberof CircuitUpdateDto
     */
    location_x?: number;
    /**
     * @type {number}
     * @memberof CircuitUpdateDto
     */
    location_y?: number;
    /**
     * @type {string}
     * @memberof CircuitUpdateDto
     */
    parent_circuit?: string;
    /**
     * @type {string}
     * @memberof CircuitUpdateDto
     */
    gate_type?: string;
}