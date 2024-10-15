import { ethers } from 'ethers';
import materialTrackingJson from './MaterialTracking.json';

// Define the contract address (ensure this matches your deployed contract address)
const contractAddress = materialTrackingJson.address;

// Create an interface for the contract
const MaterialTrackingInterface = new ethers.utils.Interface(materialTrackingJson.abi);

// Function to connect to the Ethereum provider
const getProvider = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.providers.Web3Provider(window.ethereum);
  } else {
    throw new Error("Ethereum provider is not available");
  }
};

// Function to get the contract instance
export const getContract = () => {
  const provider = getProvider();
  return new ethers.Contract(contractAddress, MaterialTrackingInterface, provider);
};

// Function to get a signer for sending transactions
const getSigner = async () => {
  const provider = getProvider();
  await provider.send("eth_requestAccounts", []); // Request account access
  return provider.getSigner();
};

// Function to create a material shipment
export const createMaterialShipment = async (
  _contractor: string,
  _materialType: string,
  _quantity: number,
  _pickupTime: number,
  _distance: number,
  _price: number
) => {
  const signer = await getSigner();
  const contract = new ethers.Contract(contractAddress, MaterialTrackingInterface, signer);
  
  const transaction = await contract.createMaterialShipment(
    _contractor,
    _materialType,
    _quantity,
    _pickupTime,
    _distance,
    { value: ethers.utils.parseEther(_price.toString()) } // Assuming the price is in Ether
  );

  await transaction.wait(); // Wait for the transaction to be mined
  return transaction; // Return transaction details
};

// Function to start a material shipment
export const startMaterialShipment = async (supplier: string, contractor: string, index: number) => {
  const signer = await getSigner();
  const contract = new ethers.Contract(contractAddress, MaterialTrackingInterface, signer);

  const transaction = await contract.startMaterialShipment(supplier, contractor, index);
  await transaction.wait(); // Wait for the transaction to be mined
  return transaction; // Return transaction details
};

// Function to complete a material shipment
export const completeMaterialShipment = async (supplier: string, contractor: string, index: number) => {
  const signer = await getSigner();
  const contract = new ethers.Contract(contractAddress, MaterialTrackingInterface, signer);

  const transaction = await contract.completeMaterialShipment(supplier, contractor, index);
  await transaction.wait(); // Wait for the transaction to be mined
  return transaction; // Return transaction details
};

// Function to get details of a specific material shipment
export const getShipmentDetails = async (supplier: string, index: number) => {
  const contract = getContract();
  const shipmentDetails = await contract.getMaterialShipment(supplier, index);
  return shipmentDetails; // Returns details of the shipment
};

// Function to get total shipments for a supplier
export const getMaterialShipmentsCount = async (supplier: string) => {
  const contract = getContract();
  const count = await contract.getMaterialShipmentsCount(supplier);
  return count; // Returns the count of shipments for the supplier
};

// Function to get all material shipment transactions
export const getAllMaterialTransactions = async () => {
  const contract = getContract();
  const transactions = await contract.getAllMaterialTransactions();
  return transactions; // Returns an array of material transactions
};

// Example function to get the history of transactions for a specific supplier
export const getSupplierTransactions = async (supplier: string) => {
  const count = await getMaterialShipmentsCount(supplier);
  const transactions = [];
  for (let i = 0; i < count.toNumber(); i++) {
    const shipment = await getShipmentDetails(supplier, i);
    transactions.push(shipment);
  }
  return transactions; // Returns an array of supplier transactions
};
