function GetIpfsUrlFromPinata(pinataUrl: string): string[] {
    const IPFSUrlParts = pinataUrl.split("/");
    const hash = IPFSUrlParts[IPFSUrlParts.length - 1];
  
    const gateways: string[] = [
      "https://ipfs.io/ipfs/",
      "https://gateway.pinata.cloud/ipfs/",
      "https://cloudflare-ipfs.com/ipfs/",
      "https://dweb.link/ipfs/",
      "https://infura-ipfs.io/ipfs/"
    ];
  
    return gateways.map(gateway => `${gateway}${hash}`);
  }
  
  export default GetIpfsUrlFromPinata;
  