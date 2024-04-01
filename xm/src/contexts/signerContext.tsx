import React, { useContext, useEffect, useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import contractConfig from "../config/contractConfig";
import nftContractConfig from "../config/nftContractConfig";
import { IUserData, IStreamerData, IStreamData } from "@/utils/types";
import { getContract } from 'viem'
import { BigNumber } from "ethers";;
import { publicClient } from 'components/client'

export const SignerContext = React.createContext<{
  signer: any | undefined | null;
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
  signer: undefined,
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
  const { data: signer, isError } = useWalletClient();
  const { address } = useAccount();
  const [contract, setContract] = useState();
  const [nftContract, setNftContract] = useState();
  const [isUser, setIsUser] = useState<boolean>(false);
  const [userData, setUserData] = useState<IUserData>();
  const [isStreamer, setIsStreamer] = useState<boolean>(false);
  const [streamerData, setStreamerData] = useState<IStreamerData>();
  const [streamerBalance, setStreamerBalance] = useState<number>();
  const [livestreams, setLivestreams] = useState<IStreamData[]>([]);

  const getContractInfo = async () => {

    const contract: any = getContract({
      address: `0x${contractConfig.address}`,
      abi: contractConfig.abi,
      client: { public: publicClient }
    })
    const nftContract: any = getContract({
      address: `0x${nftContractConfig.address}`,
      abi: nftContractConfig.abi,
      client: { public: publicClient }
    })

    let [ isUser, userData,isStreamer,streamerData,streamerBalanceData ]:[any,any,any,any,any] = await Promise.all([
      publicClient.readContract({
        ...contract,
        functionName: 'isUser',
        args: [address]
      }),
      publicClient.readContract({
        ...contract,
        functionName: 'addToUser',
        args: [address]
      }),
      publicClient.readContract({
        ...contract,
        functionName: 'isStreamer',
        args: [`0x${contractConfig.address}`]
      }),
      publicClient.readContract({
        ...contract,
        functionName: 'addToStreamer',
        args: [`0x${contractConfig.address}`]
      }),
      publicClient.readContract({
        ...contract,
        functionName: 'streamerToBalance',
        args: [address]
      }),
    ])

    // const isUser: any = await contract.watchEvent.isUser(address);
    setIsUser(isUser);

    if (isUser) {
      // const userData: IUserData = await contract.read.addToUser(address);
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
    // const isStreamer: boolean = await contract.read.isStreamer(address);
    setIsStreamer(isStreamer);
    if (isStreamer) {
      // const streamerData: IStreamerData = await contract.read.addToStreamer(address);
      const bigNumberStreamerId = BigNumber.from(streamerData.streamerId);
      const streamerId = bigNumberStreamerId.toString();
      const bigTotalNfts = BigNumber.from(streamerData.totalNfts);
      const totalNfts = bigTotalNfts.toString();
      const bigNumberSubscribers = BigNumber.from(streamerData.subscribers);
      const subscribers = bigNumberSubscribers.toString();
      // const streamerBalanceData = await contract.read.streamerToBalance(address);
      const streamerBalance = parseFloat(streamerBalanceData) / 10 ** 18;
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
    setContract(contract);
    setNftContract(nftContract);
  };

  const getLivestreamsData = async () => {
    //@ts-ignore
    const livestreamsData: IStreamData[] = await contract.read.getLiveStreams();
    console.log(livestreamsData);
    setLivestreams(livestreamsData);
  };

  useEffect(() => {
    if (signer && address) {
      console.log("signerContext was called");
      getContractInfo();
    }
  }, [signer, address]);

  return (
    <SignerContext.Provider
      value={{
        signer,
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
