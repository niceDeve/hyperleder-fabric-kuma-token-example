const {ChaincodeError} = require('@kunstmaan/hyperledger-fabric-node-chaincode-utils');

const CONSTANTS = require('./../common/constants');
const ERRORS = require('./../common/constants/errors');

class AbstractWallet {

    static async queryWalletById(txHelper, id) {
        const dbData = await txHelper.getStateAsObject(id);

        return mapDBDataToObject(dbData);
    }

    static async queryWallets(txHelper, type, query) {
        const allResults = await txHelper.getQueryResultAsList({
            'selector': {
                '$and': [
                    {
                        'type': type
                    },
                    query
                ]
            }
        });

        return allResults.map((result) => result.record).map(mapDBDataToObject);
    }

    get properties() {

        return {};
    }

    set properties(value) {
        // ABSTRACT doesn't have properties, do nothing
    }

    constructor({address, amount = 0.0, type = CONSTANTS.WALLET_TYPES.ABSTRACT}) {
        this.address = address;
        this.amount = amount;
        this.type = type;
    }

    addAmount(amount) {
        if (amount < 0) {

            throw new ChaincodeError();
        }

        this.amount += amount;

        return this;
    }

    canSpendAmount(amount) {

        return this.amount - amount >= 0;
    }

    txCreatorHasPermissions() {

        return false;
    }

    async save(txHelper) {
        await txHelper.putState(this.address, {
            'address': this.address,
            'amount': this.amount,
            'type': this.type,
            'properties': this.properties
        });

        return this;
    }

}

module.exports = AbstractWallet;

function mapDBDataToObject(dbData) {
    if (!CONSTANTS.WALLET_TYPE_CLASSNAME_MAPPING.keys().includes(dbData.type)) {

        throw new ChaincodeError(ERRORS.TYPE_ERROR, {
            'type': dbData.type
        });
    }

    const className = CONSTANTS.WALLET_TYPE_CLASSNAME_MAPPING[dbData.type];
    const Class = require(`./${className}`);

    const instance = new Class({
        address: dbData.address,
        amount: dbData.amount,
        type: dbData.type
    });

    instance.properties = dbData.properties || {};

    return instance;
}
