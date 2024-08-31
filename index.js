import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [inputValue, setInputValue] = useState(""); // State to manage user input

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // once the wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const deposit = async () => {
    if (atm) {
      let tx = await atm.deposit(1);
      await tx.wait();
      getBalance();
    }
  };

  const withdraw = async () => {
    try {
      if (atm) {
        let tx = await atm.withdraw(1);
        await tx.wait();
        getBalance();
      }
    } catch (error) {
      console.error("Withdraw error:", error.message);
    }
  };

  const initUser = () => {
    // Check to see if the user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask to use this ATM.</p>;
    }

    // Check to see if the user is connected. If not, connect to their account
    if (!account) {
      return (
        <button onClick={connectAccount}>Please connect your Metamask wallet</button>
      );
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <button onClick={deposit}>Deposit 1 ETH</button>
        <button onClick={withdraw}>Withdraw 1 ETH</button>
        <form>
        <label>
          Enter a number:
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
          />
        </label>
        <button type="button" onClick={testRevertExample}>
          Test Revert Example
        </button>
        <button type="button" onClick={testAssertExample}>
          Test Assert Example
        </button>
      </form>
      </div>
    );
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const testRevertExample = async () => {
    try {
      if (atm) {
        // Check if inputValue is a valid number before proceeding
        if (!isNaN(inputValue)) {
          let result = await atm.revertExample(inputValue);
          console.log("Revert Example Result:", result);
        } else {
          console.error("Invalid input for revertExample.");
        }
      }
    } catch (error) {
      console.error("Revert Example error:", error.message);
    }
  };

  const testAssertExample = async () => {
    try {
      if (atm) {
        // Check if inputValue is a valid number before proceeding
        if (!isNaN(inputValue)) {
          let result = await atm.assertExample(inputValue);
          console.log("Assert Example Result:", result);
        } else {
          console.error("Invalid input for assertExample.");
        }
      }
    } catch (error) {
      console.error("Assert Example error:", error.message);
    }
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
        }
      `}</style>
    </main>
  );
}
