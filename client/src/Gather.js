
import {useEffect, useState} from 'react';
import { Button } from '@audius/stems'
import '@audius/stems/dist/stems.css'
import '@audius/stems/dist/avenir.css'

import Graph from "react-graph-vis";
import abi from './abis/Dividend_Rights_Token.js'
import Counter from './Counter/Counter.js'

import Web3 from 'web3';

const SuperfluidSDK = require("@superfluid-finance/js-sdk");
const { Web3Provider } = require("@ethersproject/providers");
const { web3tx } = require("@decentral.ee/web3-helpers");

// import "./network.css";

let sf;
let web3;
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

    web3 = new Web3(window.ethereum)

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
        address: walletAddress[0],
        token: daiXToken
    });
    
    setUser(outFlow)

    const detailsOutFlow = await outFlow.details();
    console.log(detailsOutFlow);
  }

  const end = () => {
    console.log('end')
     user.flow({
      recipient: accountWallet,
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

    // starting pool configs
    const DEFAULT_POOL_INDEX_ID = 15;
    const users = ['0x70997970c51812dc3a010c7d01b50e0d17dc79c8', "0xeCcaB154b9c8DB8F93DB67608ffe6A5d2001eCdc"]

    // create pool
    const pool = await user.createPool({ poolId: DEFAULT_POOL_INDEX_ID });
    console.log(pool)

    // count users connected
    const usersLength = users.length

    // divide by user account
    const shareSplit = 1/usersLength * 100

    // split tokens to users, approve subscriptions
    for (var i = 0; i> usersLength; i++){
      let shares = await user.giveShares({ poolId: 1, recipient: users[i], shares: shareSplit });
      console.log(shares)



    let call = [
              [
                  201, // approve the ticket fee
                  sf.agreements.ida.address,
                  web3.eth.abi.encodeParameters(
                    ["bytes", "bytes"],
                    [
                        sf.agreements.ida.contract.methods
                            .approveSubscription(
                                daiXToken,
                                users[i],
                                DEFAULT_POOL_INDEX_ID, // INDEX_ID
                                "0x"
                            )
                            .encodeABI(), // callData
                        "0x" // userData
                    ]
                  )
              ],
              [
                201, // create constant flow (10/mo)
                sf.agreements.cfa.address,
                web3.eth.abi.encodeParameters(
                    ["bytes", "bytes"],
                    [
                        sf.agreements.cfa.contract.methods
                            .createFlow(
                                daiXToken,
                                users[i],
                                '1000',
                                "0x"
                            )
                            .encodeABI(), // callData
                        "0x" // userData
                    ]
                )
              ],
            ]
      const tx = await sf.host.batchCall(call);
      console.log(tx)
    }

    // distribute funds to pool
    const distributedPool = await user.distributeToPool({ poolId: DEFAULT_POOL_INDEX_ID, amount: 1000 });
    console.log(distributedPool)

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
