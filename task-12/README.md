# How to port an existing Ethereum dApp to Polyjuice

## Concepts
### What is the Nervos Blockchain?
 The Nervos blockchain, also known as the Common Knowledge Base, is the bottom-most layer in the Nervos ecosystem. It serves as a foundation to build on and provides trust to all layers built on top. It is designed to maximize decentralization while remaining minimal, flexible, and secure. Its main purpose is the reliable preservation of any data and assets stored within it.

### What is Godwoken?
Godwoken is a layer 2 rollup framework for use with the Nervos CKB layer 1 blockchain. When combined with the EVM-compatible Polyjuice framework, Solidity dApps can be run on Nervos' layer 2.

Godwoken is highly flexible and extensible, allowing it to support optimistic rollups, and potentially other rollup methods such as ZK-rollups in the future. Godwoken currently uses Proof of Authority based consensus, but will add Proof of Stake as an alternative in the near future.

Godwoken is designed to be used with a second framework which defines the programming model used within the layer 2 environment. Polyjuice is the first such implementation, which provides Ethereum EVM compatibility. Alternate implementations can be created to support compatibility with programming models from other blockchains, such as EOS, Stellar, and Libra.

- [Github](https://github.com/nervosnetwork/godwoken)
- [Documentation](https://github.com/nervosnetwork/godwoken/tree/master/docs)

### What is Polyjuice?
 Polyjuice is an Ethereum EVM-compatible execution environment, which allows Solidity based smart contracts to run on Nervos. 
 The goal of Polyjuice is to provide a 100% compatibility with all EVM based dApps allowing all Ethereum contracts to run on Nervos without any modification.

 Polyjuice is designed to be used with the Godwoken layer 2 rollup framework. This allows Polyjuice to completely move smart contract execution off of layer 1 to layer 2, providing scalability that goes far beyond what the Ethereum Mainnet is capable of today.

 - [Github](https://github.com/nervosnetwork/godwoken-polyjuice)

## Getting-Started

###  Setup the Godwoken Testnet Network in MetaMask
 1. Your MetaMask wallet will need to be configured to communicate with the Godwoken Layer 2 network. To do this, you will need to configure a new custom RPC. From the network selection dropdown, select "Custom RPC".

![Alt text](https://github.com/leomanza/nervos-hackathon/blob/master/task-12/MM_1.png)

 2. Enter the following details in the given form.
 ```
 Network Name: Godwoken Testnet
 RPC URL: https://godwoken-testnet-web3-rpc.ckbapp.dev
 Chain ID: 71393
 Currency Symbol: <Leave Empty>
 Block Explorer URL: <Leave Empty>
 ```
### Setup your existing dApp
 We will go through porting an existing Ethereum DApp [TodoApp](https://github.com/leomanza/nervos-hackathon/tree/master/app-ethereum) to Polyjuice.

 Prerequisites for your dev environment:
 - Build Tools
 - Curl
 - 7zip (optional)
 - Git
 - Node.js 14.17.x (LTS)
 - Python 2.7.x
 - Yarn
 - Docker

 1. Clone your dApp or open it locally.
 ```
 git clone https://github.com/leomanza/nervos-hackathon/tree/master/app-on-godwoken
 cd app-on-godwoken
 ```
 2. Install dependencies
 ```
 yarn
 ```

 ### Install Polyjuice Dependencies
 Install the required dependencies for working with Godwoken and Polyjuice.
  ```
 cd app-on-godwoken
 yarn add @polyjuice-provider/web3@0.0.1-rc7 nervos-godwoken-integration@0.0.6
  ```
 - @polyjuice-provider/web3 is a custom Polyjuice web3 provider. It is required for interaction with Nervos' Layer 2 smart contracts.
 - nervos-godwoken-integration is a tool that can generate Polyjuice address based on your Ethereum address. You might  be required to use Polyjuice address if you store values mapped to addresses in your contracts.

 ### Configure the Web3 Provider for the Polyjuice Web3 Provider
 Polyjuice Web3 Provider replaces the normal web3 provider that may be currently in use for Ethereum with one for the Godwoken Testnet.
 
1. Create a new file config.ts with the values for the Polyjuice Web3 Provider with the following values
```
export const CONFIG = {
    WEB3_PROVIDER_URL: 'https://godwoken-testnet-web3-rpc.ckbapp.dev',
    ROLLUP_TYPE_HASH: '0x4cc2e6526204ae6a2e8fcf12f7ad472f41a1606d5b9624beebd215d780809f6a',
    ETH_ACCOUNT_LOCK_CODE_HASH: '0xdeec13a7b8e100579541384ccaf4b5223733e4a5483c3aec95ddc4c1d5ea5b22'
};
```
 You can find a full list of the various values for the Godwoken Testned [here](https://github.com/jjyr/godwoken-testnet)

2. Add the following lines in the main dependency section of the file \src\ui\app.tsx
```
import { PolyjuiceHttpProvider } from '@polyjuice-provider/web3';
import { CONFIG } from '../config';
```
 
3. In \src\ui\app.tsx, locate the existing Ethereum Web3 instance, which should match the line below. 
```
const web3 = new Web3(window.ethereum);
```
 Delete the line above and replace it with the Polyjuice Web3 Provider from above.
```
const godwokenRpcUrl = CONFIG.WEB3_PROVIDER_URL;
const providerConfig = {
    rollupTypeHash: CONFIG.ROLLUP_TYPE_HASH,
    ethAccountLockCodeHash: CONFIG.ETH_ACCOUNT_LOCK_CODE_HASH,
    web3Url: godwokenRpcUrl
};
const provider = new PolyjuiceHttpProvider(godwokenRpcUrl, providerConfig);
const web3 = new Web3(provider);
```
4. The Ethereum app display the balance on ETH, wich is converted from wei. Nervos Layer 2 balance is obtained on Shannon. 1 CKB equals 10``**``8 shannons.
   Replace **toEth** function and calculate the balance from shannon to CKB:
   ```
   const toCkb = (shannon: bigint) => (shannon / 10n ** 8n).toString();
   ```
5. Set High Gas Limit
Godwoken requires the gas limit to be set when sending transactions. This may not always be the case in the future, but it is a requirement for the current version on the Testnet.
To accomodate for this, we can make a simple change to default the gas limit to 6000000 for the user when they make transactions.

1. Create a constant that contains the gas property used by MetaMask and include the code above in the top region of \src\lib\contracts\TodosWrapper.ts
```
const DEFAULT_SEND_OPTIONS = {
    gas: 6000000
};
```
2. Add the constant into the object passed to *add* function as the default values:
```
const tx = await this.contract.methods.add(value).send({
    ...DEFAULT_SEND_OPTIONS,
    from: fromAddress,
    value
});
```

### Compile the contract and run the app
Open a new terminal an run:
```
cd app-on-godwoken
yarn
yarn build
yarn ui
```
Open another terminal to run ganache
```
cd app-on-godwoken
yarn start:ganache
```

1. Open http://localhost:3000 in a browser to run your app.
2. Change your MetaMask network to *Godwoken Testnet*
3. You can now try out the application running on the Godwoken Testnet. Congrats!

![Alt text](https://github.com/leomanza/nervos-hackathon/blob/master/task-12/app_running.gif)





