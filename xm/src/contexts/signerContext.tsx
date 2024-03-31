import React, { useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { Signer } from "ethers";
import { useAccount } from "wagmi";
import contractConfig from "../config/contractConfig";
import nftContractConfig from "../config/nftContractConfig";
import { IUserData, IStreamerData, IStreamData } from "@/utils/types";
import { BigNumber } from "ethers";
import { createConfig, http, mainnet, sepolia } from 'wagmi';
import { WagmiProvider } from 'wagmi';

export const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

export const SignerContext = React.createContext<{
  signer: Signer | undefined | null;
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
  getLivestreamsData: async () => {},
  getContractInfo: async () => {},
});

export const useSignerContext = () => useContext(SignerContext);

export const SignerContextProvider = ({ children }: any) => {
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
    const contract: any = new ethers.Contract(
      contractConfig.address,
      contractConfig.abi,
      signer as Signer
    );
    const nftContract: any = new ethers.Contract(
      nftContractConfig.address,
      nftContractConfig.abi,
      signer as Signer
    );
    const isUser: boolean = await contract.isUser(address);
    setIsUser(isUser);
    if (isUser) {
      const userData: IUserData = await contract.addToUser(address);
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
    const isStreamer: boolean = await contract.isStreamer(address);
    setIsStreamer(isStreamer);
    if (isStreamer) {
      const streamerData: IStreamerData = await contract.addToStreamer(address);
      const bigNumberStreamerId = BigNumber.from(streamerData.streamerId);
      const streamerId = bigNumberStreamerId.toString();
      const bigTotalNfts = BigNumber.from(streamerData.totalNfts);
      const totalNfts = bigTotalNfts.toString();
      const bigNumberSubscribers = BigNumber.from(streamerData.subscribers);
      const subscribers = bigNumberSubscribers.toString();
      const streamerBalanceData = await contract.streamerToBalance(address);
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
    setContract(contract)
  }

  return (
    <WagmiProvider config={config}>
      <SignerContext.Provider
        value={{
          signer: signer,
          contract: contract,
          nftContract: nftContract,
          isUser: isUser,
          userData: userData,
          isStreamer: isStreamer,
          streamerData: streamerData,
          streamerBalance: streamerBalance,
          livestreams: livestreams,
          getLivestreamsData: getLivestreamsData,
          getContractInfo: getContractInfo,
        }}
      >
        {children}
      </SignerContext.Provider>
    </WagmiProvider>
  );
};
