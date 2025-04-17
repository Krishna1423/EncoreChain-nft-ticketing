export const imageMap: Record<number, string> = {
  0: "https://aquamarine-above-viper-774.mypinata.cloud/ipfs/bafybeihpu2ve2uwt367wz5464whtqwmbfi2orgdpoiqxs6s6f5lxy5djuq",
  1: "https://aquamarine-above-viper-774.mypinata.cloud/ipfs/bafybeieeh5mgpdxenbxbs5l4jdpw7jll3dhnqla5qawcki5pxsbirkvfqm",
};

export const getTokenURIByEventId = (eventId: string | number): string => {
  const uriMap: Record<string, string> = {
    "0": "https://aquamarine-above-viper-774.mypinata.cloud/ipfs/bafkreihy4654wyxo7aqyustzorsyo4bhxzuitihghwf6dms74xw44yhhqa",
    "1": "https://aquamarine-above-viper-774.mypinata.cloud/ipfs/bafkreifxiru5qgbcv4g4nlramzrbjpmuu5z2issguremvgym4ei5xjhhgu",
  };

  return uriMap[eventId.toString()] || ""; // Empty fallback
};
