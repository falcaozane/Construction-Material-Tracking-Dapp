"use server";

import axios from "axios";

const jwt = process.env.JWT;

interface IPFSUploadResponse {
  success: boolean;
  pinataURL?: string;
  message?: string;
}

export const uploadJSONToIPFS = async (JSONBody: object): Promise<IPFSUploadResponse> => {
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
  try {
    const res = await axios.post(url, JSONBody, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    return {
      success: true,
      pinataURL: "https://gateway.pinata.cloud/ipfs/" + res.data.IpfsHash,
    };
  } catch (error: any) {
    console.error(error);
    return {
      success: false,
      message: error.message,
    };
  }
};

export const uploadFileToIPFS = async (data: FormData): Promise<IPFSUploadResponse> => {
  const pinataMetadata = JSON.stringify({
    name: (data.get("file") as File).name,
  });
  data.append("pinataMetadata", pinataMetadata);

  const pinataOptions = JSON.stringify({
    cidVersion: 0,
  });
  data.append("pinataOptions", pinataOptions);

  try {
    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      data,
      {
        maxBodyLength: Infinity,
        headers: {
          "Content-Type": `multipart/form-data; boundary=${(data as any)._boundary}`,
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    return {
      success: true,
      pinataURL: "https://gateway.pinata.cloud/ipfs/" + res.data.IpfsHash,
    };
  } catch (error: any) {
    console.error(error);
    return {
      success: false,
      message: error.message,
    };
  }
};
