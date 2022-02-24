import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

import { contractABI, contractAddress } from '../utils/constants';

export const TransactionContext = React.createContext();

const { ethereum } = window;

const getEthereumContractAddress = () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const transactionContract = new ethers.Contract(contractAddress, contractABI, signer)


    return transactionContract
}

export const TransactionProvider = ({ children }) => {

    const [CurrentAccount, setCurrentAccount] = useState('');
    const [isloading, setIsloading] = useState(false)
    const [formData, setformData] = useState({ addressTo: '', amount: '', keyword: '', message: '' })
    const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount'))
    const [transactions, setTransactions]=useState([])
    const handleChange = (e, name) => {
        setformData((prevState) => ({ ...prevState, [name]: e.target.value }))
    }
    const getAllTransactions = async () => {
        try{
            if(!ethereum) return alert("please install metamask");
            const transactionContract=getEthereumContractAddress();
            const availableTransactions =await transactionContract.getAllTransactions();
            const structuredTransactions = availableTransactions.map((transaction)=>({
                addressTo: transaction.receiver,
                addressFrom: transaction.sender,
                timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
                message: transaction.message,
                keyword: transaction.keyword,
                amount: parseInt(transaction.amount._hex) / (10 ** 18)
            }))
            console.log(structuredTransactions);
            setTransactions(structuredTransactions);
            

        }catch(error)
        {
            console.log(error);
        }
    }
    const checkIfWalletIsConnected = async () => {

        try {

            if (!ethereum) return alert("please install metamask");

            const accounts = await ethereum.request({ method: 'eth_accounts' });

            if (accounts.length) { setCurrentAccount(accounts[0]);
            getAllTransactions(); }
            else { console.log("no acc") }


        }
        catch (error) {
            console.log(error);
            throw new Error("No ethereum object.")
        }
    }

    const checkIfTransactionsExists = async () =>
    {
        try{
            const transactionContract=getEthereumContractAddress();
            const currentTransactionCount = await transactionContract.getTransactionCount();
            window.localStorage.setItem("transactionCount",currentTransactionCount);
        }catch(error)
        {
            console.log(error);
            throw new Error("No ethereum object.")
        }
    }

    const sendTransaction = async () => {
        try {
            if (!ethereum) return alert("please install metamask");

            const { addressTo, amount, keyword, message } = formData;

            const transactionsContract = getEthereumContractAddress();

            const parsedAmount = ethers.utils.parseEther(amount);

            await ethereum.request({
                method: "eth_sendTransaction",
                params: [{
                    from: CurrentAccount,
                    to: addressTo,
                    gas: "0x5208",
                    value: parsedAmount._hex,
                }],
            });
            const transactionHash = await transactionsContract.addToBlockchain(addressTo, parsedAmount, keyword, message)

            setIsloading(true);
            console.log(`Loading - ${transactionHash.hash}`);
            await transactionHash.wait();
            console.log(`Success - ${transactionHash.hash}`);
            setIsloading(false);
           


            //setTransactionCount(transactionCount.toNumber());
            window.location.reload();
        } catch (error) {
            console.log(error);
            throw new Error("No ethereum object.")
        }
    }

    const connectWallet = async () => {

        try {
            if (!ethereum) return alert("please install metamask");
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            setCurrentAccount(accounts[0])
        } catch (error) {
            console.log(error);
            throw new Error("No ethereum object.")
        }


    }

    useEffect(() => {
        checkIfWalletIsConnected();
        checkIfTransactionsExists();
    }, [])

    return (
        <TransactionContext.Provider value={{ connectWallet, CurrentAccount, sendTransaction, formData, handleChange, transactions, isloading }}>
            {children}
        </TransactionContext.Provider>
    )

}