import React, { useEffect, useState } from "react";
import { useAddress, useNetwork, useDisconnect, useMetamask } from '@thirdweb-dev/react';
import { ethers } from "ethers";
// import { useNFTCollection } from "@thirdweb-dev/react";
import SmoothApe from './utils/SmoothApe.json';
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';

const TWITTER_HANDLE = 'realsbd';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
// const OPENSEA_LINK = '';
// const TOTAL_MINT_COUNT = 5;
// rinkeby contract
// const CONTRACT_ADDRESS = "0x8B631a5528dF6d9383a636Af81FC1233eD8736F4";

// mainnet contract
const CONTRACT_ADDRESS = "0x34DaE4b30fb93B1ed5fcfde3F58360Af31E659cD";

function App() {
  // const [currentAccount, setCurrentAccount] = useState("");
    const [data, setData] = useState({
      reveals: "",
      // concatenate presale with "ether"
      presale: "",
      costPrice: "",
      wallet: "",
      nftGive: ""
    });


  const connectWithMetamask = useMetamask();
  const disconnectWallet = useDisconnect();
  const address = useAddress();
  const network = useNetwork();


  const ConnectWallet = () => {
  
    // If a wallet is connected, show address, chainId and disconnect button
    if (address) {
      return (
        <div className="toMint">
          Address: {address}
          <br />
          Chain ID: {network[0].data.chain && network[0].data.chain.id}
          <br />
          {renderMintUI()}
          
          <button onClick={disconnectWallet} className="cta-button connect-wallet-button">Disconnect</button>
        </div>
      );
    }
  
    // If no wallet is connected, show connect wallet options
    return (
      <div>
        <button onClick={() => connectWithMetamask()} className="cta-button connect-wallet-button">Connect MetaMask</button>
      </div>
    );
  };


  useEffect(() => {
    renderOtherFunctions()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const renderOtherFunctions = () => {
    if (address === "0x372cb859273f9791d24B9131A0eA85E71Ed6ab10") {
      return (
        <div>
          <div>
            <form onSubmit={(e) => mintApeTo(e)}>
              <p>Mint Ape to a wallet FREE</p>
              <input type="text" placeholder="wallet address" name="wallet" value={data.wallet} onChange={(e) => handle(e) } />
              <input type="text" placeholder="How many NFT?" name="nftGive" value={data.nftGive} onChange={(e) => handle(e) } />
              <button type="submit">Mint !!!</button>
            </form>
          </div>
          <div>
            <form onSubmit={(e) => reveal(e)} >
              <p>Set Reveal</p>
              <input type="text" placeholder="true" name="reveals" value={data.reveals} onChange={(e) => handle(e) } />
              <button type="submit" >Set</button>
            </form>
          </div>
          <div>
            <form onSubmit={(e) => setCost(e)}>
              <p>Set Presale and Cost price</p>
              <input type="text" placeholder="Presales price" name="presale" value={data.presale} onChange={(e) => handle(e) } />
              <input type="text" placeholder="Cost price" name="costPrice" value={data.costPrice} onChange={(e) => handle(e) } />
              <input type="submit" value="Set" />
            </form>
          </div>
        </div>
      )
    }
  }

  function handle(e) {
    const newData = { ...data };
    newData[e.target.name] = e.target.value;
    
    setData(newData);
  }

  const reveal = async (e) => {
    e.preventDefault();
    try {
      const { ethereum } = window;
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, SmoothApe.abi, signer);
      let revealTxn = await connectedContract.reveal(data.reveals);
      console.log("setting reveal..... please wait");
      await revealTxn.wait();
      

    } catch (error) {
      console.log(error);
    }
  }

  const setCost = async (e) => {
    e.preventDefault();
    try {
      const { ethereum } = window;
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, SmoothApe.abi, signer);
      let setCost = await connectedContract.setCost(data.presale.toString(), data.costPrice.toString());
      console.log("setting cost..... please wait");
      await setCost.wait();
      

    } catch (error) {
      console.log(error);
    }
  }

  const askContractToMintNft = async () => {
    
    if (network[0].data.chain && network[0].data.chain.id === 1) {
      try {
        const { ethereum } = window;
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, SmoothApe.abi, signer);
        // get cost price
        let costPrice =  await connectedContract.getCostPrice();
  
        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = await connectedContract.mintApe({ value: costPrice.toString()});
  
        // let nftTxn = await connectedContract.mintApe({ value: ethers.utils.parseEther(costPrice.toString())});
  
        console.log("minting..... please wait");
        await nftTxn.wait();
        console.log(nftTxn);
        connectedContract.on("EmitNFT", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          alert(
              `Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          )
        });
  
        console.log(`Mined, see transaction: https://etherscan.io/tx/${nftTxn.hash}`);
  
      } catch (error) {
        console.log(error)
      }
    } else {alert("Please connect to the mainnet")}
  }

  const mintApeTo = async (e) => {
    e.preventDefault();
    try {
      const { ethereum } = window;
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, SmoothApe.abi, signer);
      console.log(data.wallet + " " + data.nftGive);
      let nftTxn = await connectedContract.mintApeTo(data.wallet, data.nftGive);
      console.log("minting..... please wait");
      await nftTxn.wait();
      console.log(nftTxn);
      console.log(`Mined, see transaction: https://etherscan.io/tx/${nftTxn.hash}`);

    } catch (error) {
      console.log(error)
    }
  }

  const renderMintUI = () => (
    <button onClick={askContractToMintNft} className="cta-button connect-wallet-button mintButton">
      MINT NFT!!!
    </button>
  )

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <h1 className="header"> SMOOTH APE <br/> COUNTRY CLUB </h1>
          <ConnectWallet />
          {renderOtherFunctions()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
}

export default App;
