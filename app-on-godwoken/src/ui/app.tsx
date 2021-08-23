/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import { ToastContainer, toast } from 'react-toastify';
import './app.scss';
import 'react-toastify/dist/ReactToastify.css';
import { PolyjuiceHttpProvider } from '@polyjuice-provider/web3';
import { AddressTranslator } from 'nervos-godwoken-integration';
import { TodosWrapper } from '../lib/contracts/TodosWrapper';
import { SudtERC20ProxyWrapper } from '../lib/contracts/SudtERC20ProxyWrapper';
import { CONFIG } from '../config';

async function createWeb3() {
    
    if ((window as any).ethereum) {
        const godwokenRpcUrl = CONFIG.WEB3_PROVIDER_URL;
        const providerConfig = {
            rollupTypeHash: CONFIG.ROLLUP_TYPE_HASH,
            ethAccountLockCodeHash: CONFIG.ETH_ACCOUNT_LOCK_CODE_HASH,
            web3Url: godwokenRpcUrl
        };

        const provider = new PolyjuiceHttpProvider(godwokenRpcUrl, providerConfig);
        const web3 = new Web3(provider || Web3.givenProvider);

        try {
            // Request account access if needed
            await (window as any).ethereum.enable();
        } catch (error) {
            // User denied account access...
        }

        return web3;
    }

    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    return null;
}

export function App() {
    const [web3, setWeb3] = useState<Web3>(null);
    const [contract, setContract] = useState<TodosWrapper>();
    const [accounts, setAccounts] = useState<string[]>();
    const [l2Balance, setL2Balance] = useState<bigint>();
    const [proxyContract, setProxyContract] = useState<SudtERC20ProxyWrapper>();
    const [layer2ckETHBalance, setLayer2ckETHBalance] = useState<bigint>();
    const [existingContractIdInputValue, setExistingContractIdInputValue] = useState<string>();
    const [existingERC20ContractIdInputValue, setExistingERC20ContractIdInputValue] = useState<
        string
    >();

    const [storedValue, setStoredValue] = useState<string[] | undefined>();
    const [deployTxHash, setDeployTxHash] = useState<string | undefined>();
    const [polyjuiceAddress, setPolyjuiceAddress] = useState<string | undefined>();
    const [layer2DepositAddress, setLayer2DepositAddress] = useState<string | undefined>();
    const [transactionInProgress, setTransactionInProgress] = useState(false);
    const toastId = React.useRef(null);
    const [newStoredStringInputValue, setNewStoredStringInputValue] = useState<
        string | undefined
    >();

    useEffect(() => {
        async function getAddreses() {
            const addressTranslator = new AddressTranslator();
            setPolyjuiceAddress(addressTranslator.ethAddressToGodwokenShortAddress(accounts[0]));
            const depositAddress = await addressTranslator.getLayer2DepositAddress(
                web3,
                accounts[0]
            );
            setLayer2DepositAddress(depositAddress.addressString);
            if (existingERC20ContractIdInputValue) {
                setExistingERC20ProxyContractAddress(existingERC20ContractIdInputValue);
            }
        }
        if (accounts?.[0]) {
            getAddreses();
        } else {
            setPolyjuiceAddress(undefined);
        }
    }, [accounts?.[0]]);

    useEffect(() => {
        if (proxyContract) {
            async function getLayer2ETHBalance() {
                const _l2ckETHBalance = await proxyContract.getBalanceOf(polyjuiceAddress, account);
                setLayer2ckETHBalance(_l2ckETHBalance);
            }
            getLayer2ETHBalance();
        }
    }, [proxyContract]);

    useEffect(() => {
        if (transactionInProgress && !toastId.current) {
            toastId.current = toast.info(
                'Transaction in progress. Confirm MetaMask signing dialog and please wait...',
                {
                    position: 'top-right',
                    autoClose: false,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    closeButton: false
                }
            );
        } else if (!transactionInProgress && toastId.current) {
            toast.dismiss(toastId.current);
            toastId.current = null;
        }
    }, [transactionInProgress, toastId.current]);

    const account = accounts?.[0];

    async function deployContract() {
        const _contract = new TodosWrapper(web3);

        try {
            setDeployTxHash(undefined);
            setTransactionInProgress(true);

            const transactionHash = await _contract.deploy(account);

            setDeployTxHash(transactionHash);
            setExistingContractAddress(_contract.address);
            toast(
                'Successfully deployed a smart-contract. You can now proceed to get or set the value in a smart contract.',
                { type: 'success' }
            );
        } catch (error) {
            console.error(error);
            toast.error(
                'There was an error sending your transaction. Please check developer console.'
            );
        } finally {
            setTransactionInProgress(false);
        }
    }
    async function deployERC20ProxyContract() {
        const _contract = new SudtERC20ProxyWrapper(web3);

        try {
            setDeployTxHash(undefined);
            setTransactionInProgress(true);

            const transactionHash = await _contract.deploy(account);

            setExistingERC20ProxyContractAddress(_contract.address);
            toast(
                'Successfully deployed a smart-contract. You can now proceed to get or set the value in a smart contract.',
                { type: 'success' }
            );
        } catch (error) {
            console.error(error);
            toast.error(
                'There was an error sending your transaction. Please check developer console.'
            );
        } finally {
            setTransactionInProgress(false);
        }
    }

    async function getStoredValue() {
        const value = await contract.getStoredValue(account);
        toast('Successfully read latest stored value.', { type: 'success' });

        setStoredValue(value);
    }

    async function setExistingContractAddress(contractAddress: string) {
        const _contract = new TodosWrapper(web3);
        _contract.useDeployed(contractAddress.trim());

        setContract(_contract);
        setStoredValue(undefined);
    }

    async function setExistingERC20ProxyContractAddress(contractAddress: string) {
        const _contract = new SudtERC20ProxyWrapper(web3);
        _contract.useDeployed(contractAddress.trim());

        setProxyContract(_contract);
    }

    async function setNewStoredValue() {
        try {
            setTransactionInProgress(true);
            await contract.setStoredValue(newStoredStringInputValue, account);
            toast(
                'Successfully set latest stored value. You can refresh the read value now manually.',
                { type: 'success' }
            );
        } catch (error) {
            console.error(error);
            toast.error(
                'There was an error sending your transaction. Please check developer console.'
            );
        } finally {
            setTransactionInProgress(false);
        }
    }

    useEffect(() => {
        if (web3) {
            return;
        }

        (async () => {
            const _web3 = await createWeb3();
            setWeb3(_web3);

            const _accounts = [(window as any).ethereum.selectedAddress];
            setAccounts(_accounts);
            console.log({ _accounts });

            if (_accounts && _accounts[0]) {
                const _l2Balance = BigInt(await _web3.eth.getBalance(_accounts[0]));
                setL2Balance(_l2Balance);
            }
        })();
    });

    const toCkb = (shannon: bigint) => (shannon / 10n ** 8n).toString();

    const LoadingIndicator = () => <span className="rotating-icon">⚙️</span>;

    return (
        <div>
            Your ETH address: <b>{accounts?.[0]}</b>
            <br />
            <br />
            Your Polyjuice address: <b>{polyjuiceAddress || ' - '}</b>
            <br />
            <br />
            Nervos Layer 2 balance:{' '}
            <b>{l2Balance ? toCkb(l2Balance) : <LoadingIndicator />} CKB</b>
            <br />
            <br />
            {layer2ckETHBalance && (
                <p>Layer 2 ckETH balance: {layer2ckETHBalance.toString()} Wei</p>
            )}
            <br />
            <br />
            {layer2DepositAddress && (
                <div>
                    <p>Layer2 Deposit Address: {layer2DepositAddress}</p>
                    <a
                        href="https://force-bridge-test.ckbapp.dev/bridge/Ethereum/Nervos?xchain-asset=0x0000000000000000000000000000000000000000"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Deposit to Layer2 using Force bridge
                    </a>
                </div>
            )}
            <br />
           
            <hr />
            <p>
                The button below will deploy the smart contract where you can add numbers
                values. After the contract is deployed you can either read stored values from smart
                contract or add a new one. You can do that using the interface below.
            </p>
            <button onClick={deployContract} disabled={!l2Balance}>
                Deploy contract
            </button>
            &nbsp;or&nbsp;
            <input
                id='contract'
                placeholder="Existing contract id"
                onChange={e => setExistingContractIdInputValue(e.target.value)}
            />
            <button
                disabled={!existingContractIdInputValue || !l2Balance}
                onClick={() => setExistingContractAddress(existingContractIdInputValue)}
            >
                Use existing contract
            </button>
            <br />
            <br />
            Deployed contract address: <b>{contract?.address || '-'}</b> <br />
            <br />
            <hr />
            <p>The button below will deploy a ERC20 proxy contract.</p>
            <button onClick={deployERC20ProxyContract}>
                Deploy contract
            </button>
            &nbsp;or&nbsp;
            <input
            id='erc20Contract'
                placeholder="Existing contract id"
                onChange={e => setExistingERC20ContractIdInputValue(e.target.value)}
            />
            <button
                disabled={!existingERC20ContractIdInputValue}
                onClick={() =>
                    setExistingERC20ProxyContractAddress(existingERC20ContractIdInputValue)
                }
            >
                Use existing contract
            </button>
            <br />
            <br />
            Deployed contract address: <b>{proxyContract?.address || '-'}</b> <br />
            <br />
            <hr />
            <br />
            <br />
            <button onClick={getStoredValue} disabled={!contract}>
                Get stored numbers
            </button>
            {storedValue ? <>&nbsp;&nbsp;Stored numbers: {storedValue.toString()}</> : ''}
            <br />
            <br />
            <input type="text" onChange={e => setNewStoredStringInputValue(e.target.value)} />
            <button onClick={setNewStoredValue} disabled={!contract}>
                Add new number
            </button>
            <br />
            <br />
            <br />
            <br />
            <hr />
            The contract is deployed on Nervos Layer 2 - Godwoken + Polyjuice. After each
            transaction you might need to wait up to 120 seconds for the status to be reflected.
            <ToastContainer />
        </div>
    );
}
