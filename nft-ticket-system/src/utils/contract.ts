import { ethers } from "ethers";
import ABI from "@/abi/NFTTicket.json";

const CONTRACT_ADDRESS = "0xfE8405eB5F951EcED65F9f2565aD17A8561e963F";

export const getContract = (providerOrSigner: any) => {
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, providerOrSigner);
};
