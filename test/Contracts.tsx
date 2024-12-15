import { ethers } from 'ethers';
import materialTrackingJson from './MaterialTracking.json';
import { useContext } from "react";

import { WalletContext } from "@/context/wallet";


// Define the contract address
const contractAddress = materialTrackingJson.address;

// Create an interface for the contract
const MaterialTrackingInterface = new ethers.Interface(materialTrackingJson.abi);

// Get Ethereum provider
// const getProvider = () => {
//   if (typeof window !== 'undefined' && window.ethereum) {
//     return new ethers.providers.Web3Provider(window.ethereum);
//   } else {
//     throw new Error("Ethereum provider is not available");
//   }
// };

// Get Contract instance
export const getContract = () => {
    const { signer } = useContext(WalletContext);
  return new ethers.Contract(contractAddress, MaterialTrackingInterface, signer);
};

// Get a Signer
const getSigner = async () => {
  const provider = getProvider();
  await provider.send("eth_requestAccounts", []);
  return provider.getSigner();
};

// Function to create a new material shipment
export const createMaterialShipment = async (
  contractor: string,
  materialType: string,
  quantity: number,
  pickupTime: number,
  distance: number,
  price: string
) => {
  const signer = await getSigner();
  const contractWithSigner = getContract().connect(signer);

  const transaction = await contractWithSigner.createMaterialShipment(
    contractor,
    materialType,
    quantity,
    pickupTime,
    distance,
    ethers.parseEther(price), // Convert price to Wei
    { value: ethers.parseEther(price) } // Send the price as value
  );

  return transaction.wait(); // Wait for the transaction to be mined
};

// Function to start a shipment (mark as "In Transit")
export const startMaterialShipment = async (
  supplier: string,
  contractor: string,
  index: number
) => {
  const signer = await getSigner();
  const contractWithSigner = getContract().connect(signer);

  const transaction = await contractWithSigner.startMaterialShipment(supplier, contractor, index);
  return transaction.wait();
};

// Function to complete a shipment (mark as "Delivered" and handle payment)
export const completeMaterialShipment = async (
  supplier: string,
  contractor: string,
  index: number
) => {
  const signer = await getSigner();
  const contractWithSigner = getContract().connect(signer);

  const transaction = await contractWithSigner.completeMaterialShipment(supplier, contractor, index);
  return transaction.wait();
};

// Function to get details of a specific material shipment
export const getMaterialShipment = async (
  supplier: string,
  index: number
) => {
  const contract = getContract();
  const shipment = await contract.getMaterialShipment(supplier, index);

  // Parse the returned shipment data into a more usable format
  return {
    supplier: shipment[0],
    contractor: shipment[1],
    materialType: shipment[2],
    quantity: Number(shipment[3]),
    pickupTime: Number(shipment[4]),
    deliveryTime: Number(shipment[5]),
    distance: Number(shipment[6]),
    price: ethers.formatEther(shipment[7]), // Convert price from Wei to Ether
    status: shipment[8], // Enum (0: PENDING, 1: IN_TRANSIT, 2: DELIVERED)
    isPaid: shipment[9]
  };
};

// Function to get total number of shipments for a supplier
export const getMaterialShipmentsCount = async (supplier: string) => {
  const contract = getContract();
  const count = await contract.getMaterialShipmentsCount(supplier);
  return Number(count);
};

// Function to get all material shipment transactions
export const getAllMaterialTransactions = async () => {
  const contract = getContract();
  const shipments = await contract.getAllMaterialTransactions();
  
  return shipments.map((shipment: any) => ({
    supplier: shipment.supplier,
    contractor: shipment.contractor,
    materialType: shipment.materialType,
    quantity: Number(shipment.quantity),
    pickupTime: Number(shipment.pickupTime),
    deliveryTime: Number(shipment.deliveryTime),
    distance: Number(shipment.distance),
    price: ethers.formatEther(shipment.price), // Convert price from Wei to Ether
    status: shipment.status,
    isPaid: shipment.isPaid
  }));
};
