"use client";

import React, { useState, useContext, useEffect } from "react";
import { WalletContext } from "@/context/wallet";
import { ethers } from "ethers";
import materialTracking from "@/app/materialTracking.json";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface MaterialShipment {
  supplier: string;
  contractor: string;
  materialType: string;
  quantity: number;
  pickupTime: bigint;
  deliveryTime: bigint;
  distance: bigint;
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

const ViewTransactionsPage = () => {
  const { signer } = useContext(WalletContext) as { signer: any };
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<MaterialShipment[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<MaterialShipment[]>([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter state
  const [filters, setFilters] = useState({
    status: "all",
    materialType: "",
    address: "",
    addressType: "both", // "supplier", "contractor", or "both"
    sortBy: "pickupTime",
    sortOrder: "desc",
    minAmount: "",
    maxAmount: "",
  });

  const formatAddress = (address: string): string => {
    return `${address}`;
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

  const fetchTransactions = async () => {
    if (!signer) {
      setError("Please connect your wallet");
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

      const allTransactions = await contract.getAllMaterialTransactions();
      const formattedTransactions = allTransactions.map((tx: any) => ({
        supplier: tx.supplier,
        contractor: tx.contractor,
        materialType: tx.materialType,
        quantity: ethers.formatUnits(tx.quantity,18),
        pickupTime: tx.pickupTime,
        deliveryTime: tx.deliveryTime,
        distance: tx.distance,
        price: tx.price,
        status: (tx.status),
        isPaid: tx.isPaid,
      }));

      console.log(formattedTransactions)

      setTransactions(formattedTransactions);
      applyFilters(formattedTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setError("Failed to fetch transactions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (transactionsData: MaterialShipment[]) => {
    let filtered = [...transactionsData];

    // Apply status filter
    if (filters.status !== "all") {
      filtered = filtered.filter(
        tx => tx.status === parseInt(filters.status)
      );
    }

    // Apply material type filter
    if (filters.materialType) {
      filtered = filtered.filter(
        tx => tx.materialType.toLowerCase().includes(filters.materialType.toLowerCase())
      );
    }

    // Apply address filter
    if (filters.address) {
      const lowerAddress = filters.address.toLowerCase();
      filtered = filtered.filter(tx => {
        if (filters.addressType === "supplier") {
          return tx.supplier.toLowerCase().includes(lowerAddress);
        } else if (filters.addressType === "contractor") {
          return tx.contractor.toLowerCase().includes(lowerAddress);
        } else {
          return (
            tx.supplier.toLowerCase().includes(lowerAddress) ||
            tx.contractor.toLowerCase().includes(lowerAddress)
          );
        }
      });
    }

    // Apply price range filter
    if (filters.minAmount) {
      filtered = filtered.filter(
        tx => Number(ethers.formatEther(tx.price)) >= Number(filters.minAmount)
      );
    }
    if (filters.maxAmount) {
      filtered = filtered.filter(
        tx => Number(ethers.formatEther(tx.price)) <= Number(filters.maxAmount)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[filters.sortBy as keyof MaterialShipment];
      const bValue = b[filters.sortBy as keyof MaterialShipment];

      if (typeof aValue === "bigint" && typeof bValue === "bigint") {
        return filters.sortOrder === "asc"
          ? Number(aValue - bValue)
          : Number(bValue - aValue);
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return filters.sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });

    setFilteredTransactions(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  // Effect to fetch transactions on mount
  useEffect(() => {
    fetchTransactions();
  }, [signer]);

  // Effect to apply filters when they change
  useEffect(() => {
    if (transactions.length > 0) {
      applyFilters(transactions);
    }
  }, [filters]);

  if (!signer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-violet-100 border border-violet-400 text-violet-700 px-4 py-3 rounded">
          Please connect your wallet to continue.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold text-violet-600 text-center">All Material Transactions</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Status Filter */}
        {/* <div>
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
        </div> */}

        {/* Material Type Filter */}
        <div>
          <Label>Material Type</Label>
          <Input
            value={filters.materialType}
            onChange={(e) => setFilters({ ...filters, materialType: e.target.value })}
            placeholder="Filter by material..."
            className="mt-1"
          />
        </div>

        {/* Address Filter */}
        <div>
          <Label>Address Search</Label>
          <Input
            value={filters.address}
            onChange={(e) => setFilters({ ...filters, address: e.target.value })}
            placeholder="Filter by address..."
            className="mt-1"
          />
        </div>

        {/* Address Type Filter */}
        <div>
          <Label>Address Type</Label>
          <Select
            value={filters.addressType}
            onValueChange={(value) => setFilters({ ...filters, addressType: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by address type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="both">Both</SelectItem>
              <SelectItem value="supplier">Supplier</SelectItem>
              <SelectItem value="contractor">Contractor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Minimum Amount Filter */}
        {/* <div>
          <Label>Min Amount (ETH)</Label>
          <Input
            value={filters.minAmount}
            onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
            placeholder="Min amount..."
            className="mt-1"
          />
        </div> */}

        {/* Maximum Amount Filter */}
        {/* <div>
          <Label>Max Amount (ETH)</Label>
          <Input
            value={filters.maxAmount}
            onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
            placeholder="Max amount..."
            className="mt-1"
          />
        </div> */}

        {/* Sorting Options */}
        <div>
          <Label>Sort By</Label>
          <Select
            value={filters.sortBy}
            onValueChange={(value) => setFilters({ ...filters, sortBy: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pickupTime">Pickup Time</SelectItem>
              <SelectItem value="deliveryTime">Delivery Time</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="quantity">Quantity</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Sort Order</Label>
          <Select
            value={filters.sortOrder}
            onValueChange={(value) => setFilters({ ...filters, sortOrder: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Table className="min-w-full mt-6">
        <TableHeader>
          <TableRow>
            <TableHead>Sr.no</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Contractor</TableHead>
            <TableHead>Material Type</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Pickup Time</TableHead>
            {/* <TableHead>Delivery Time</TableHead> */}
            <TableHead>Price (ETH)</TableHead>
            {/* <TableHead>Status</TableHead>
            <TableHead>Payment Status</TableHead> */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentTransactions.map((tx, index) => (
            <TableRow key={index}>
              <TableCell>{index}</TableCell>
              <TableCell>{formatAddress(tx.supplier)}</TableCell>
              <TableCell>{formatAddress(tx.contractor)}</TableCell>
              <TableCell>{tx.materialType}</TableCell>
              <TableCell>{tx.quantity}</TableCell>
              <TableCell>{formatTimestamp(tx.pickupTime)}</TableCell>
              {/* <TableCell>{formatTimestamp(tx.deliveryTime)}</TableCell> */}
              <TableCell>{ethers.formatEther(tx.price)} ETH</TableCell>
              {/* <TableCell>
                <StatusBadge status={Number(tx.status)} />
              </TableCell> */}
              {/* <TableCell>{tx.isPaid ? "Paid" : "Unpaid"}</TableCell> */}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-end mt-4">
        <Pagination>
          <PaginationPrevious
            onClick={() => setCurrentPage(currentPage - 1)}
            
          >
            Previous
          </PaginationPrevious>
          <PaginationContent>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => setCurrentPage(page)}
                  className={page === currentPage ? "font-bold" : ""}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
          </PaginationContent>
          <PaginationNext
            onClick={() => setCurrentPage(currentPage + 1)}
            
          >
            Next
          </PaginationNext>
        </Pagination>
      </div>
    </div>
  );
};

export default ViewTransactionsPage;
