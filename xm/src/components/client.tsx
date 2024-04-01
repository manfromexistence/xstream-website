import { createPublicClient, createWalletClient, http, custom } from 'viem'
import { mainnet } from 'viem/chains'
 
export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
})
