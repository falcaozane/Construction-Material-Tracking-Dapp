// "use client";

// import { useState,useContext } from 'react';
// import { ethers } from 'ethers';
// import { WalletContext } from "@/context/wallet";
// import materialPoSVerification from '@/app/MaterialPoSVerification.json';

// export default function AddMaterial() {
//   const [batchID, setBatchID] = useState('');
//   const [materialType, setMaterialType] = useState('');
//   const [supplier, setSupplier] = useState('');
//   const [quantity, setQuantity] = useState('');
//   const { signer } = useContext(WalletContext);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!signer) return;

//     try {
//       const contract = new ethers.Contract(
//         materialPoSVerification.address,
//         materialPoSVerification.abi,
//         signer
//       );
//       await contract.addMaterial(batchID, materialType, supplier, ethers.parseUnits(quantity, 'ether'), signer.getAddress());
//       alert('Material added successfully');
//     } catch (error) {
//       console.error('Error adding material:', error);
//       alert('Error adding material');
//     }
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen">
//       <h1 className="text-4xl font-bold mb-8">Add Material</h1>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label>Batch ID:</label>
//           <input value={batchID} onChange={(e) => setBatchID(e.target.value)} className="border" />
//         </div>
//         <div>
//           <label>Material Type:</label>
//           <input value={materialType} onChange={(e) => setMaterialType(e.target.value)} className="border" />
//         </div>
//         <div>
//           <label>Supplier:</label>
//           <input value={supplier} onChange={(e) => setSupplier(e.target.value)} className="border" />
//         </div>
//         <div>
//           <label>Quantity:</label>
//           <input value={quantity} onChange={(e) => setQuantity(e.target.value)} className="border" />
//         </div>
//         <button type="submit" className="bg-blue-500 text-white px-4 py-2">Add Material</button>
//       </form>
//     </div>
//   );
// }

import React from 'react'

export const page = () => {
  return (
    <div>page</div>
  )
}
