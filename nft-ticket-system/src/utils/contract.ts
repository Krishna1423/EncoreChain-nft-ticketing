import { ethers } from "ethers";
import ABI from "@/abi/NFTTicket.json";

const CONTRACT_ADDRESS = "0xf58A2830da86A14f313dae168FaF38e5e5cA492D";

export const getContract = (providerOrSigner: any) => {
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, providerOrSigner);
};
