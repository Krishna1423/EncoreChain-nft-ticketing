export const imageMap: Record<number, string> = {
  0: "https://aquamarine-above-viper-774.mypinata.cloud/ipfs/bafybeihpu2ve2uwt367wz5464whtqwmbfi2orgdpoiqxs6s6f5lxy5djuq",
  1: "https://aquamarine-above-viper-774.mypinata.cloud/ipfs/bafybeieeh5mgpdxenbxbs5l4jdpw7jll3dhnqla5qawcki5pxsbirkvfqm",
};

export const getTokenURIByEventId = (eventId: string | number): string => {
  const uriMap: Record<string, string> = {
    "0": "https://aquamarine-above-viper-774.mypinata.cloud/ipfs/bafkreigcuvtkangakkjgvtif5s7xw4i2nwlw55pnvecyf6sw2ajv6a57hm",
    "1": "https://aquamarine-above-viper-774.mypinata.cloud/ipfs/bafkreidlpu5ntninwjqr4htdw4gyoy5tx436geatx3c4a6n6g3bhrt6oqu",
  };

  return uriMap[eventId.toString()] || ""; // Empty fallback
};
