"use client";
import React, { useEffect, useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Button 
} from '@mui/material';
import { Search } from 'lucide-react';
import axiosInstance from '@/utils/axiosInstance';

interface Order {
  id: string;
  farmerId: {
    firstName: string;
    lastName: string;
  };
  orderStatus: string;
  paymentStatus: string;
  invoiceGenerated: boolean;
  createdAt: string;
  invoiceId: string;
  totalCost: number;
}

type SearchTypes = 'orderId' | 'invoiceId' | 'farmerName';

const OrderList = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchType, setSearchType] = useState<SearchTypes>('orderId');
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

  useEffect(() => {
    axiosInstance
      .get('/orders/all')
      .then((response) => {
        // Sort orders by date (latest first) before setting state
        const sortedOrders = response.data.orders.sort((a: Order, b: Order) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrders(sortedOrders);
        setFilteredOrders(sortedOrders);
      })
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredOrders(orders);
      return;
    }

    const filtered = orders.filter(order => {
      const searchLower = searchTerm.toLowerCase();
      
      switch (searchType) {
        case 'orderId':
          return order.id.toLowerCase().includes(searchLower);
        case 'invoiceId':
          return order.invoiceId?.toLowerCase().includes(searchLower);
        case 'farmerName':
          const fullName = `${order.farmer?.firstName} ${order.farmer?.lastName}`.toLowerCase();
          return fullName.includes(searchLower);
        default:
          return false;
      }
    });
    setFilteredOrders(filtered);
  }, [searchTerm, searchType, orders]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Orders</h1>
        
        {/* Search Section */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={`Search by ${
                searchType === 'orderId' ? 'Order ID' : 
                searchType === 'invoiceId' ? 'Invoice ID' : 
                'Farmer Name'
              }...`}
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-black"
            />
          </div>
          
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as SearchTypes)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-black"
          >
            <option value="orderId">Order ID</option>
            <option value="invoiceId">Invoice ID</option>
            <option value="farmerName">Farmer Name</option>
          </select>
        </div>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Invoice ID</TableCell>
              <TableCell>Farmer Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Payment Status</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.invoiceId || "Invoice not created"}</TableCell>
                  <TableCell>{order?.farmer?.firstName} {order?.farmer?.lastName}</TableCell>
                  <TableCell>{order.orderStatus}</TableCell>
                  <TableCell>{order.paymentStatus}</TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      href={`/dashboard/orders/order/${order.id}`}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default OrderList;
