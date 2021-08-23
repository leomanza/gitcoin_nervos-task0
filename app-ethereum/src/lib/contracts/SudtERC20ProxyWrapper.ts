import Web3 from 'web3';
import * as ERC20JSON from '../../../build/contracts/ERC20.json';
import { ERC20 } from '../../types/ERC20';

const DEFAULT_SEND_OPTIONS = {
    to: '0x' + new Array(40).fill(0).join(''),
    gas: 6000000,
    gasPrice: '0'
};
const SUDT_ID = '2587';
const SUDT_NAME = 'EATEREUM';
const SUDT_SYMBOL = 'EAT';
const SUDT_TOTAL_SUPPLY = 9999999999;


export class SudtERC20ProxyWrapper {
    web3: Web3;

    contract: ERC20;

    address: string;

    constructor(web3: Web3, existingContractAddress?: string) {
        this.web3 = web3;
        this.contract = new web3.eth.Contract(ERC20JSON.abi as any, existingContractAddress) as any;
    }

    get isDeployed() {
        return Boolean(this.address);
    }

    
    async getBalanceOf(polyjuiceAddress: string, fromAddress: string) {
        return BigInt(
            await this.contract.methods
              .balanceOf(polyjuiceAddress)
              .call({
                from: fromAddress,
              })
          );

    }

    async deploy(fromAddress: string) {
        const tx = this.contract
            .deploy({
                data: ERC20JSON.bytecode,
                arguments: [SUDT_NAME, SUDT_SYMBOL, SUDT_TOTAL_SUPPLY, SUDT_ID]
            })
            .send({
                ...DEFAULT_SEND_OPTIONS,
                from: fromAddress
            });

        let transactionHash: string = null;
        tx.on('transactionHash', (hash: string) => {
            transactionHash = hash;
        });

        const contract = await tx as any;
        this.useDeployed(contract.contractAddress);

        return transactionHash;
    }

    useDeployed(contractAddress: string) {
        this.address = contractAddress;
        this.contract.options.address = contractAddress;
    }
}
