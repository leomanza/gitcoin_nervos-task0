import Web3 from 'web3';
import * as TodosJSON from '../../../build/contracts/ToDos.json';
import { Todos } from '../../types/Todos';

export class TodosWrapper {
    web3: Web3;

    contract: Todos;

    address: string;

    constructor(web3: Web3) {
        this.web3 = web3;
        this.contract = new web3.eth.Contract(TodosJSON.abi as any) as any;
    }

    get isDeployed() {
        return Boolean(this.address);
    }

    async getStoredValue(fromAddress: string) {
        const data = await this.contract.methods.get().call({ from: fromAddress });

        return data;
    }

    async setStoredValue(value: string, fromAddress: string) {
        const tx = await this.contract.methods.add(value).send({
            from: fromAddress,
            value
        });

        return tx;
    }

    async deploy(fromAddress: string) {
        const tx = this.contract
            .deploy({
                data: TodosJSON.bytecode,
                arguments: []
            })
            .send({
                from: fromAddress
            });

        let transactionHash: string = null;
        tx.on('transactionHash', (hash: string) => {
            transactionHash = hash;
        });

        const contract = await tx;

        this.useDeployed(contract.options.address);

        return transactionHash;
    }

    useDeployed(contractAddress: string) {
        this.address = contractAddress;
        this.contract.options.address = contractAddress;
    }
}
