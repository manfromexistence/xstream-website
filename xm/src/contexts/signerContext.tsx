import React, { useContext, useEffect, useState } from "react";
// import { ethers } from "ethers";
// import { Signer } from "ethers";
// import { BigNumber } from "ethers";

import { useAccount, useWalletClient } from "wagmi";
import contractConfig from "../config/contractConfig";
import nftContractConfig from "../config/nftContractConfig";
import { IUserData, IStreamerData, IStreamData } from "@/utils/types";
import { mainnet } from 'viem/chains'
import { Chain, EIP1193RequestFn, TransportConfig, getContract } from 'viem'
import { createPublicClient, createWalletClient, http, custom } from 'viem'
import { BigNumber } from "ethers";

// Viam Clients
const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})
// const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
// const client = createWalletClient({
//   chain: mainnet, 
//   transport: http(),

// })


// const logs = await contract.getEvents.Transfer()
// const unwatch = contract.watchEvent.Transfer(
//   { from: contractConfig.address },
//   { onLogs(logs: any) { console.log(logs) } }
// )

export const SignerContext = React.createContext<{
  WalletClient: any | undefined | null;
  contract: any;
  nftContract: any;
  isUser: boolean;
  userData: IUserData | undefined;
  isStreamer: boolean;
  streamerData: IStreamerData | undefined;
  streamerBalance: number | undefined;
  livestreams: IStreamData[] | [];
  getLivestreamsData: () => Promise<void>;
  getContractInfo: () => Promise<void>;
}>({
  WalletClient: undefined,
  contract: undefined,
  nftContract: undefined,
  isUser: false,
  userData: undefined,
  isStreamer: false,
  streamerData: undefined,
  streamerBalance: undefined,
  livestreams: [],
  getLivestreamsData: async () => { },
  getContractInfo: async () => { },
});

export const useSignerContext = () => useContext(SignerContext);

export const SignerContextProvider = ({ children }: any) => {
  const { data: WalletClient, isError } = useWalletClient();
  const { address } = useAccount();
  const [contract, setContract] = useState<any>();
  const [nftContract, setNftContract] = useState<any>();
  const [isUser, setIsUser] = useState<boolean>(false);
  const [userData, setUserData] = useState<IUserData>();
  const [isStreamer, setIsStreamer] = useState<boolean>(false);
  const [streamerData, setStreamerData] = useState<IStreamerData>();
  const [streamerBalance, setStreamerBalance] = useState<number>();
  const [livestreams, setLivestreams] = useState<IStreamData[]>([]);

  const getContractInfo = async () => {
    // const contract: any = new ethers.Contract(
    //   contractConfig.address,
    //   contractConfig.abi,
    //   WalletClient as Signer
    // );
    // const nftContract: any = new ethers.Contract(
    //   nftContractConfig.address,
    //   nftContractConfig.abi,
    //   WalletClient as Signer
    // );
    // Contracts
    const contract = getContract({
      address: `0x${contractConfig.address}`,
      abi: contractConfig.abi,
      client: { public: client }
    })
    const nftContract = getContract({
      address: `0x${nftContractConfig.address}`,
      abi: nftContractConfig.abi,
      client: { public: client }
    })

    // const [isUser, totalSupply, symbol, tokenUri, balance] = await Promise.all([
    //   client.readContract({
    //     ...contractConfig,
    //     functionName: 'isUser',
    //   }),
    //   client.readContract({
    //     ...contractConfig,
    //     functionName: 'totalSupply',
    //   }),
    //   client.readContract({
    //     ...contractConfig,
    //     functionName: 'symbol',
    //   }),
    //   client.readContract({
    //     ...contractConfig,
    //     functionName: 'tokenURI',
    //     args: [420n],
    //   }),
    //   client.readContract({
    //     ...contractConfig,
    //     functionName: 'balanceOf',
    //     args: [address],
    //   }),
    // ])
    
    const isUserResult = await client.readContract({
      address:  `0x${contractConfig.address}`,
      abi: contractConfig.abi,
      functionName: 'isUser',
      args: [`0x${contractConfig.address}`]
    })
    const userDataResult = await client.readContract({
      address:  `0x${contractConfig.address}`,
      abi: contractConfig.abi,
      functionName: 'addToUser',
      args: [`0x${contractConfig.address}`]
    })

    const isUser: any = isUserResult;

    setIsUser(isUser);
    if (isUser) {
      const userData: any = await userDataResult;
      const bigNumberUserId = BigNumber.from(userData.userId);
      const userId = bigNumberUserId.toString();
      setUserData({
        ...userData,
        userId: userId,
        userAdd: userData.userAdd,
        name: userData.name,
        desp: userData.desp,
        profilePicture: userData.profilePicture,
        collection: userData.collection,
      });
    }

    const isStreamerResult = await client.readContract({
      address:  `0x${contractConfig.address}`,
      abi: contractConfig.abi,
      functionName: 'isStreamer',
      args: [`0x${contractConfig.address}`]
    })
    const streamerDataResult = await client.readContract({
      address:  `0x${contractConfig.address}`,
      abi: contractConfig.abi,
      functionName: 'streamerData',
      args: [`0x${contractConfig.address}`]
    })
    const streamerToBalanceResult = await client.readContract({
      address:  `0x${contractConfig.address}`,
      abi: contractConfig.abi,
      functionName: 'streamerToBalance',
      args: [`0x${contractConfig.address}`]
    })
    const isStreamer: any = await isStreamerResult;
    setIsStreamer(isStreamer);
    if (isStreamer) {
      const streamerData: any = await streamerDataResult;
      const bigNumberStreamerId = BigNumber.from(streamerData.streamerId);
      const streamerId = bigNumberStreamerId.toString();
      const bigTotalNfts = BigNumber.from(streamerData.totalNfts);
      const totalNfts = bigTotalNfts.toString();
      const bigNumberSubscribers = BigNumber.from(streamerData.subscribers);
      const subscribers = bigNumberSubscribers.toString();
      const streamerBalanceData = await streamerToBalanceResult;
      // const streamerBalance = parseFloat(streamerBalanceData) / 10 ** 18;
      const streamerBalance:any = streamerBalanceData;
      setStreamerBalance(streamerBalance);
      setStreamerData({
        ...streamerData,
        streamerId: streamerId,
        streamerAdd: streamerData.streamerAdd,
        name: streamerData.name,
        desp: streamerData.desp,
        nftImage: streamerData.nftImage,
        profilePicture: streamerData.profilePicture,
        totalNfts: totalNfts,
        categories: streamerData.categories,
        followers: streamerData.followers,
        subscribers: subscribers,
        isLive: streamerData.isLive,
      });
    }
    setContract(contract.read);
    setNftContract(nftContract.read);
  };

  const getLivestreamsData = async () => {
    //@ts-ignore
    const livestreamsData: IStreamData[] = await contract.getLiveStreams();
    console.log(livestreamsData);
    setLivestreams(livestreamsData);
  };

  useEffect(() => {
    if (WalletClient && address) {
      console.log("signerContext was called");
      // getContractInfo();
    }
  }, [WalletClient, address]);

  return (
    <SignerContext.Provider
      value={{
        WalletClient,
        contract,
        nftContract,
        isUser,
        userData,
        isStreamer,
        streamerData,
        streamerBalance,
        livestreams,
        getLivestreamsData,
        getContractInfo,
      }}
    >
      {children}
    </SignerContext.Provider>
  );
};
