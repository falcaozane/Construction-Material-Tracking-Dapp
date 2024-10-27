"use client";

import React, { useState, useContext, useEffect } from "react";
import { WalletContext } from "@/context/wallet";
import { ethers } from "ethers";
import materialTracking from "@/app/materialTracking.json";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Search } from "lucide-react";

interface MaterialShipment {
  supplier: string;
  contractor: string;
  materialType: string;
  quantity: number;
  pickupTime: bigint;
  deliveryTime: bigint;
  distance: number;
  price: bigint;
  status: number;
  isPaid: boolean;
}

const StatusBadge = ({ status }: { status: number }) => {
  const getStatusColor = (status: number) => {
    switch (status) {
      case 0:
        return "bg-yellow-100 text-yellow-800";
      case 1:
        return "bg-blue-100 text-blue-800";
      case 2:
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return "PENDING";
      case 1:
        return "IN TRANSIT";
      case 2:
        return "DELIVERED";
      default:
        return "UNKNOWN";
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
      {getStatusText(status)}
    </span>
  );
};

const ViewShipmentPage = () => {
  const { signer } = useContext(WalletContext);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [shipments, setShipments] = useState<MaterialShipment[]>([]);
  const [filteredShipments, setFilteredShipments] = useState<MaterialShipment[]>([]);
  
  const [supplierAddress, setSupplierAddress] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    materialType: "",
    sortBy: "pickupTime",
    sortOrder: "desc",
  });

  const formatAddress = (address: string): string => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const formatTimestamp = (timestamp: bigint): string => {
    if (timestamp === BigInt(0)) return "N/A";
    try {
      return new Date(Number(timestamp) * 1000).toLocaleString();
    } catch (error) {
      console.error(error);
      return "Invalid Date";
    }
  };

  // Convert BigInt to number
  const convertBigIntToNumber = (value: bigint): number => {
    return Number(value.toString());
  };

  const fetchShipments = async () => {
    if (!signer || !supplierAddress) {
      setError("Please connect your wallet and enter a supplier address");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const contract = new ethers.Contract(
        materialTracking.address,
        materialTracking.abi,
        signer
      );

      const count = await contract.getMaterialShipmentsCount(supplierAddress);
      const shipmentPromises = [];

      for (let i = 0; i < Number(count); i++) {
        shipmentPromises.push(contract.getMaterialShipment(supplierAddress, i));
      }

      const shipmentsData = await Promise.all(shipmentPromises);
      const formattedShipments = shipmentsData.map(details => ({
        supplier: details[0],
        contractor: details[1],
        materialType: details[2],
        quantity: ethers.formatUnits(details[3],18),
        pickupTime: details[4],
        deliveryTime: details[5],
        distance: ethers.formatUnits(details[6],18),
        price: details[7],
        status: Number(details[8]),
        isPaid: details[9],
      }));

      setShipments(formattedShipments);
      applyFilters(formattedShipments);
    } catch (error) {
      console.error("Error fetching shipments:", error);
      setError("Failed to fetch shipments. Please verify the supplier address and try again.");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (shipmentsData: MaterialShipment[]) => {
    let filtered = [...shipmentsData];

    // Apply status filter
    if (filters.status !== "all") {
      filtered = filtered.filter(
        shipment => shipment.status === parseInt(filters.status)
      );
    }

    // Apply material type filter
    if (filters.materialType) {
      filtered = filtered.filter(
        shipment => shipment.materialType.toLowerCase().includes(filters.materialType.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[filters.sortBy as keyof MaterialShipment];
      const bValue = b[filters.sortBy as keyof MaterialShipment];

      if (typeof aValue === "bigint" && typeof bValue === "bigint") {
        // Convert BigInt to number for comparison
        const aNum = convertBigIntToNumber(aValue);
        const bNum = convertBigIntToNumber(bValue);
        return filters.sortOrder === "asc" ? aNum - bNum : bNum - aNum;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return filters.sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });

    setFilteredShipments(filtered);
  };

  useEffect(() => {
    if (shipments.length > 0) {
      applyFilters(shipments);
    }
  }, [filters]);

  if (!signer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Please connect your wallet to continue.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold text-indigo-600">View Shipments</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="supplierAddress">Supplier Address</Label>
          <div className="flex gap-2">
            <Input
              id="supplierAddress"
              value={supplierAddress}
              onChange={(e) => setSupplierAddress(e.target.value)}
              placeholder="0x..."
              className="mt-1"
            />
            <Button
              onClick={fetchShipments}
              disabled={loading}
              className="mt-1"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        <div>
          <Label>Status</Label>
          <Select
            value={filters.status}
            onValueChange={(value) => setFilters({ ...filters, status: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="0">Pending</SelectItem>
              <SelectItem value="1">In Transit</SelectItem>
              <SelectItem value="2">Delivered</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="materialType">Material Type</Label>
          <Input
            id="materialType"
            value={filters.materialType}
            onChange={(e) => setFilters({ ...filters, materialType: e.target.value })}
            placeholder="Filter by material..."
            className="mt-1"
          />
        </div>

        <div>
          <Label>Sort By</Label>
          <Select
            value={filters.sortBy}
            onValueChange={(value) => setFilters({ ...filters, sortBy: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pickupTime">Pickup Time</SelectItem>
              <SelectItem value="quantity">Quantity</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Supplier</TableHead>
              <TableHead>Contractor</TableHead>
              <TableHead>Material Type</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Pickup Time</TableHead>
              <TableHead>Delivery Time</TableHead>
              <TableHead>Distance</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Paid</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredShipments.map((shipment, index) => (
              <TableRow key={index}>
                <TableCell>{formatAddress(shipment.supplier)}</TableCell>
                <TableCell>{formatAddress(shipment.contractor)}</TableCell>
                <TableCell>{shipment.materialType}</TableCell>
                <TableCell>{convertBigIntToNumber(shipment.quantity)}</TableCell>
                <TableCell>{formatTimestamp(shipment.pickupTime)}</TableCell>
                <TableCell>{formatTimestamp(shipment.deliveryTime)}</TableCell>
                <TableCell>{convertBigIntToNumber(shipment.distance)}</TableCell>
                <TableCell>{ethers.formatEther(shipment.price)} ETH</TableCell>
                <TableCell>
                  <StatusBadge status={shipment.status} />
                </TableCell>
                <TableCell>
                  {shipment.isPaid ? (
                    <span className="text-green-600">Yes</span>
                  ) : (
                    <span className="text-red-600">No</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ViewShipmentPage;