import * as _ from 'lodash';
import * as BigNumber from 'bignumber.js';
import * as Web3 from 'web3';
import {Web3Wrapper} from '../web3_wrapper';
import {SchemaValidator} from './schema_validator';
import {utils} from './utils';

const HEX_REGEX = /^0x[0-9A-F]*$/i;

export const assert = {
    isBigNumber(variableName: string, value: BigNumber.BigNumber): void {
        const isBigNumber = _.isObject(value) && value.isBigNumber;
        this.assert(isBigNumber, this.typeAssertionMessage(variableName, 'BigNumber', value));
    },
    isUndefined(value: any, variableName?: string): void {
        this.assert(_.isUndefined(value), this.typeAssertionMessage(variableName, 'undefined', value));
    },
    isString(variableName: string, value: string): void {
        this.assert(_.isString(value), this.typeAssertionMessage(variableName, 'string', value));
    },
    isHexString(variableName: string, value: string): void {
        this.assert(_.isString(value) && HEX_REGEX.test(value),
            this.typeAssertionMessage(variableName, 'HexString', value));
    },
    isETHAddressHex(variableName: string, value: string): void {
        const web3 = new Web3();
        this.assert(web3.isAddress(value), this.typeAssertionMessage(variableName, 'ETHAddressHex', value));
    },
    async isSenderAddressAsync(variableName: string, senderAddressHex: string,
                               web3Wrapper: Web3Wrapper): Promise<void> {
        assert.isETHAddressHex(variableName, senderAddressHex);
        const isSenderAddressAvailable = await web3Wrapper.isSenderAddressAvailableAsync(senderAddressHex);
        assert.assert(isSenderAddressAvailable,
            `Specified ${variableName} ${senderAddressHex} isn't available through the supplied web3 instance`,
        );
    },
    async isUserAddressAvailableAsync(web3Wrapper: Web3Wrapper): Promise<void> {
        const availableAddresses = await web3Wrapper.getAvailableAddressesAsync();
        this.assert(!_.isEmpty(availableAddresses), 'No addresses were available on the provided web3 instance');
    },
    hasAtMostOneUniqueValue(value: any[], errMsg: string): void {
        this.assert(_.uniq(value).length <= 1, errMsg);
    },
    isNumber(variableName: string, value: number): void {
        this.assert(_.isFinite(value), this.typeAssertionMessage(variableName, 'number', value));
    },
    isValidOrderHash(variableName: string, value: string): void {
        this.assert(utils.isValidOrderHash(value), this.typeAssertionMessage(variableName, 'orderHash', value));
    },
    isBoolean(variableName: string, value: boolean): void {
        this.assert(_.isBoolean(value), this.typeAssertionMessage(variableName, 'boolean', value));
    },
    doesConformToSchema(variableName: string, value: object, schema: Schema): void {
        const schemaValidator = new SchemaValidator();
        const validationResult = schemaValidator.validate(value, schema);
        const hasValidationErrors = validationResult.errors.length > 0;
        const msg = `Expected ${variableName} to conform to schema ${schema.id}
Encountered: ${JSON.stringify(value, null, '\t')}
Validation errors: ${validationResult.errors.join(', ')}`;
        this.assert(!hasValidationErrors, msg);
    },
    assert(condition: boolean, message: string): void {
        if (!condition) {
            throw new Error(message);
        }
    },
    typeAssertionMessage(variableName: string, type: string, value: any): string {
        return `Expected ${variableName} to be of type ${type}, encountered: ${value}`;
    },
};
