
import {useEffect, useState} from 'react';
import { Button } from '@audius/stems'
import '@audius/stems/dist/stems.css'
import '@audius/stems/dist/avenir.css'

import Graph from "react-graph-vis";
import abi from './abis/Dividend_Rights_Token.js'
import Counter from './Counter/Counter.js'

const SuperfluidSDK = require("@superfluid-finance/js-sdk");
const { Web3Provider } = require("@ethersproject/providers");
const { web3tx } = require("@decentral.ee/web3-helpers");

// import "./network.css";

let sf;
const daiXToken = '0xF2d68898557cCb2Cf4C10c3Ef2B034b2a69DAD00'
function Gather() {
  const [accountWallet, setAccountWallet] = useState('')
  const [user, setUser] = useState({})
  const [isLoadAccount, setIsLoadAccount] = useState(false)

  useEffect(async () => {
    if(!isLoadAccount){
      setAccount()
      setIsLoadAccount(true)
    }
  })

  // const graph = {
  //   nodes: [
  //     { id: 1, label: "Node 1", title: "node 1 tootip text" },
  //     { id: 2, label: "Node 2", title: "node 2 tootip text" },
  //     { id: 3, label: "Node 3", title: "node 3 tootip text" },
  //     { id: 4, label: "Node 4", title: "node 4 tootip text" },
  //     { id: 5, label: "Node 5", title: "node 5 tootip text" }
  //   ],
  //   edges: [
  //     { from: 1, to: 2 },
  //     { from: 1, to: 3 },
  //     { from: 2, to: 4 },
  //     { from: 2, to: 5 }
  //   ]
  // };

  // const options = {
  //   edges: {
  //     color: "#000000"
  //   },
  //   height: "500px"
  // };

  const events = {
    select: function(event) {
      var { nodes, edges } = event;
    }
  };


  const setAccount = async () => {
    console.log('howdy')
    sf = new SuperfluidSDK.Framework({
        ethers: new Web3Provider(window.ethereum)
    });
    await sf.initialize()

    const walletAddress = await window.ethereum.request({
      method: 'eth_requestAccounts',
      params: [
        {
          eth_accounts: {}
        }
      ]
    });

    console.log("walletAddress")
    console.log(walletAddress)

    setAccountWallet(walletAddress[0])

    const carol = sf.user({
        address: walletAddress[0],
        token: daiXToken
    });

    setUser(carol)

    const details = await carol.details();
    console.log(details);

    const outFlow = sf.user({
        address: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        token: daiXToken
    });
    
    setUser(outFlow)

    const detailsOutFlow = await outFlow.details();
    console.log(detailsOutFlow);
  }

  const end = () => {
    console.log('end')
     user.flow({
      recipient: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
      flowRate: '0' // 2592 DAIx per month
    });
  }

  const start = () => {
    console.log('start')
     user.flow({
      recipient: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
      flowRate: '555555555555555' // 2592 DAIx per month
    });
  }

  const gather = async () => {
    console.log('start')

    // const apTx = await sf.agreements.ida.contract.methods
    //             .approveSubscription(daiXToken, "0xE0722C10955d263D1bA434BaB1bce1E98A925Fc4", 0, "0x")
    //             .encodeABI()
    // console.log(apTx)

    const DEFAULT_INDEX_ID = "42";

    const pool = await user.createPool({ poolId: 5 });

    const tx = await web3tx(
            sf.host.callAgreement,
            "OUT approves subscription to the app"
        )(
            sf.agreements.ida.address,
            sf.agreements.ida.contract.methods
                .approveSubscription(daiXToken, "0xE0722C10955d263D1bA434BaB1bce1E98A925Fc4", 5, "0x")
                .encodeABI(),
            "0x", // user data
        );
    console.log(tx)

    const users = ['0x70997970c51812dc3a010c7d01b50e0d17dc79c8', "0xeCcaB154b9c8DB8F93DB67608ffe6A5d2001eCdc"]
    // create pool
    console.log(pool)

    // count users connected
    const usersLength = users.length

    // divide by user account
    const shareSplit = 1/usersLength * 100

    // split tokens to users
    for (var i = 0; i> usersLength; i++){
      let shares = await user.giveShares({ poolId: 1, recipient: users[i], shares: shareSplit });
      console.log(shares)
    }
  }

  return (
    <div className="App">

      <div className="title">
        <h1 className="title">gather</h1>
        </div>
        {/*<Button text='Hello World!' />*/}
      <button className="button-begin" onClick={gather}>gather</button>
      <button className="button-begin" onClick={start}>start</button>
      <button className="button-begin" onClick={end}>stop</button>
      <Counter/>
  	</div>
  );
}

export default Gather;
