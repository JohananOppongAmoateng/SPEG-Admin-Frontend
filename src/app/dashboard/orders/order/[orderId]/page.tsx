'use client';
import { useEffect, useState } from 'react';
import axiosInstance from '@/utils/axiosInstance';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  CheckCircle,
  XCircle,
  Save,
  FileText,
  Download,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import axios from 'axios';
import StepIndicator from '@/app/(components)/stepsIndicator/StepIndicator';

// Define interfaces based on your schemas
interface Product {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  cost: number;
}

interface Order {
  _id: string;
  farmerId: {
    farmName: string;
    farmLocation: string;
    firstName: string;
    lastName: string;
    telNumber: string;
    email: string;
    _id: string;
  };
  products: Product[];
  orderStatus: string;
  paymentStatus: string;
  awaitingPickup: string;
  invoiceGenerated: boolean;
  createdAt: string;
  invoiceId: string;
  totalCost: number;
}

interface Invoice {
  _id: string;
  orderId: string;
  farmerId: string;
  currency: string;
  totalAmount: number;
  outOfOrderDate: string;
  status: string;
  pdfDownloadLink: string;
  emailSent: boolean;
}

const OrderDetails = ({ params }: any) => {
  const { orderId } = params;
  const [order, setOrder] = useState<Order | null>(null);
  const [updatedProducts, setUpdatedProducts] = useState<Product[]>([]);
  const [quantityInputs, setQuantityInputs] = useState<string[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  const [awaitingCollection, setAwaitingCollection] = useState<string>('');
  const [payment, setPayment] = useState<string>('');
  const [pickup, setPickup] = useState<string>('');
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false); // Track unsaved changes
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isProcessingReject, setProcessingReject] = useState<boolean>(false);
  const [isProcessingUpdatePayment, setProcessingUpdatePayment] =
    useState<boolean>(false);
  const [isProcessingCollection, setProcessingCollection] =
    useState<boolean>(false);
      const [showProcessSteps, setShowProcessSteps] = useState(false);
      const [approvalSteps, setApprovalSteps] = useState<
      { label: string; status: 'pending' | 'processing' | 'completed' | 'error'; error?: string | undefined }[]
    >([
        { label: 'Updating Order Status', status: 'pending' },
        { label: 'Creating Invoice', status: 'pending' },
        { label: 'Sending Email Notification', status: 'pending' },
        { label: 'Finalizing Process', status: 'pending' }
      ]);

  const router = useRouter();
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        event.preventDefault();
        event.returnValue = ''; // Show the confirmation dialog
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  useEffect(() => {
    if (orderId) {
      axiosInstance
        .get(`/orders/${orderId}`)
        .then((response) => {
          const fetchedOrder: Order = response.data.order;
          console.log(fetchedOrder, 'this is the fetched order ');
          setOrder(fetchedOrder);
          setUpdatedProducts(fetchedOrder.products);
          setPaymentStatus(fetchedOrder.paymentStatus);
          setPayment(fetchedOrder.paymentStatus);
          setPickup(fetchedOrder.awaitingPickup);
          setAwaitingCollection(fetchedOrder.awaitingPickup);
          setInvoiceId(fetchedOrder.invoiceId || null);
          // Initialize quantityInputs with current quantities
          setQuantityInputs(
            fetchedOrder.products.map((product) => product.quantity.toString())
          );
        })
        .catch((error) => console.error(error))
        .finally(() => setLoading(false));
    }
  }, [orderId]);

  // Handle quantity change
  const handleQuantityChange = (index: number, newQuantity: string) => {
    // Update the quantityInputs state
    const newQuantityInputs = [...quantityInputs];
    newQuantityInputs[index] = newQuantity;
    setQuantityInputs(newQuantityInputs);

    // Convert the input string to a number
    const parsedQuantity = parseFloat(newQuantity);
    const validQuantity =
      !isNaN(parsedQuantity) && parsedQuantity >= 0 ? parsedQuantity : 0;

    // Update the products state
    const newProducts = [...updatedProducts];
    newProducts[index].quantity = validQuantity;
    newProducts[index].cost = validQuantity * newProducts[index].unitPrice;
    setUpdatedProducts(newProducts);

    // Set unsaved changes flag
    setHasUnsavedChanges(true);
  };

  const handleApprove = async () => {
    if (!orderId || !order) {
      toast.error('Order information is missing');
      return;
    }
    
    const isConfirmed = window.confirm(
      'Are you sure you want to approve this order and create an invoice?'
    );
    if (!isConfirmed) return;
  
    setIsProcessing(true);
    setShowProcessSteps(true);
    
    try {
      // Step 1: Update order status
      setApprovalSteps(steps => steps.map((step, i) => 
        i === 0 ? { ...step, status: 'processing' } : step
      ));
      
      await axiosInstance.patch(`/orders/${orderId}`, {
        orderStatus: 'Approved',
      });
  
      setApprovalSteps(steps => steps.map((step, i) => 
        i === 0 ? { ...step, status: 'completed' } : step
      ));
  
      // Step 2: Create invoice
      setApprovalSteps(steps => steps.map((step, i) => 
        i === 1 ? { ...step, status: 'processing' } : step
      ));
  
      const newInvoice = {
        orderId,
        farmerId: order.farmerId._id,
        totalAmount: order.totalCost,
        email: order.farmerId.email,
        farmerName: `${order.farmerId.firstName} ${order.farmerId.lastName}`,
      };
  
      await axiosInstance.post('/invoices/create', newInvoice);
      
      setApprovalSteps(steps => steps.map((step, i) => 
        i === 1 ? { ...step, status: 'completed' } : step
      ));
  
      // Step 3: Email notification (assuming this happens in backend)
      setApprovalSteps(steps => steps.map((step, i) => 
        i === 2 ? { ...step, status: 'processing' } : step
      ));
      
      // Wait a bit to simulate email sending (remove if actual email sending is tracked)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setApprovalSteps(steps => steps.map((step, i) => 
        i === 2 ? { ...step, status: 'completed' } : step
      ));
  
      // Step 4: Finalizing
      setApprovalSteps(steps => steps.map((step, i) => 
        i === 3 ? { ...step, status: 'processing' } : step
      ));
  
      const refreshedOrder = await axiosInstance.get(`/orders/${orderId}`);
      setOrder(refreshedOrder.data.order);
      
      setApprovalSteps(steps => steps.map((step, i) => 
        i === 3 ? { ...step, status: 'completed' } : step
      ));
  
      toast.success('Order processed successfully');
      
      // Wait a moment before hiding the steps and refreshing
      setTimeout(() => {
        setShowProcessSteps(false);
        window.location.reload();
      }, 2000);
  
    } catch (error) {
      console.error('Error in handleApprove:', error);
      
      // Find which step was processing and mark it as error
      const processingStepIndex = approvalSteps.findIndex(step => step.status === 'processing');
      if (processingStepIndex !== -1) {
        setApprovalSteps(steps => steps.map((step, i) => 
          i === processingStepIndex ? { 
            ...step, 
            status: 'error',
            error: axios.isAxiosError(error) 
              ? error.response?.data?.message || 'Failed to process step'
              : 'An unexpected error occurred'
          } : step
        ));
      }
  
      toast.error(axios.isAxiosError(error)
        ? error.response?.data?.message || 'Failed to process order'
        : 'An unexpected error occurred'
      );
    } finally {
      // Don't hide the steps here - let user see the error if there was one
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!orderId || !order) {
      toast.error('Order information is missing');
      return;
    }
    const isConfirmed = window.confirm(
      'Are you sure you want to reject this order and delete entirely ?'
    );
    if (!isConfirmed) return;
    setProcessingReject(true);

    try {
      await axiosInstance.patch(`/orders/${orderId}`, {
        orderStatus: 'Rejected',
      });

      toast.success('Order rejected AND deleted');

      router.push('/orders');
    } catch (error) {
      console.error('Error in handleReject:', error);

      // More specific error messages based on the error type
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || 'Failed to rejecting order';
        toast.error(errorMessage);
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setProcessingReject(false);
    }
  };

  const handleSaveChanges = () => {
    if (orderId) {
      console.log(updatedProducts, 'this is the updated product');
      axiosInstance
        .patch(`/orders/${orderId}`, { products: updatedProducts })
        .then(() => {
          toast.success('Order updated');
          setHasUnsavedChanges(false); // Reset the flag after saving
        })
        .catch((error) => console.error(error));
    }
  };

  const createIssue = async () => {
    try {
      const issuerName = `${order?.farmerId.firstName} ${order?.farmerId.lastName}`;

      // Using for...of to await each post request sequentially
      for (const product of order?.products || []) {
        const data = {
          receivedFromIssuedTo: issuerName,
          qtyIssued: product.quantity,
          invoicedAmount: product.cost,
          orderId: orderId
        };

        await axiosInstance.post(
          `/transactions/issue/${product.productId}`,
          data
        );
      }

      // Only show the success toast once
      toast.success('Inventory updated successfully');
    } catch (error) {
      console.error('Error in createIssue:', error);
      toast.error('Failed to update inventory');
      throw error;
    }
  };

  const handlePaymentStatusChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setPaymentStatus(event.target.value);
  };


  const handleCollectionChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setAwaitingCollection(event.target.value);
  };

  const getInvoiceUrl = (invoiceId: any) => {
    return `${process.env.NEXT_PUBLIC_API_BASE_URL}/invoices/files/invoice_${invoiceId}.pdf`;
  };

  // handle invoice download
  const handleInvoiceDownload = () => {
    if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
      console.error('API base URL not configured');
      return;
    }

    const url = getInvoiceUrl(invoiceId);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleUpdatePaymentStatus = async () => {
    const confirm = window.confirm(
      `Are you sure you want to change payment status to ${paymentStatus}?`
    );
    if (!confirm) return;

    if (!orderId || !invoiceId) {
      return toast.error('Invoice must be created before updating payment');
    }

    setProcessingUpdatePayment(true);
    try {
      // Update order payment status
      await axiosInstance.patch(`/orders/${orderId}/status`, {
        paymentStatus: paymentStatus,
      });
      setOrder((prevOrder) =>
        prevOrder ? { ...prevOrder, paymentStatus } : null
      );

      toast.success(`Payment status updated to ${paymentStatus}`);

      // Update invoice payment status
      await axiosInstance.patch(`/invoices/${invoiceId}`, {
        status: paymentStatus,
      });
      toast.success(`Invoice payment status updated to ${paymentStatus}`);

      // Update inventory
      await createIssue();
      window.location.reload()
    } catch (error) {
      console.error('Error in handleUpdatePaymentStatus:', error);

      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || 'Failed to update payment status';
        toast.error(errorMessage);
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setProcessingUpdatePayment(false);
    }
  };

  // update pickup
  const handleUpdateCollectionStatus = async () => {
    const confirm = window.confirm(
      `Are you sure you want to change pickup for this order to ${awaitingCollection}?`
    );
    if (!confirm) return;

    if (!orderId || !invoiceId) {
      return toast.error('Invoice must be created before updating collection');
    }

    setProcessingCollection(true);
    try {
      // Update inventory
      await axiosInstance.patch(
        `/transactions/issue/${orderId}`,
        {
        awaitingPickup: awaitingCollection,
      }
      );
      await axiosInstance.patch(`/orders/${orderId}`, {
        awaitingPickup: awaitingCollection,
      });
      window.location.reload()
    } catch (error) {
      console.error('Error in handleUpdatePaymentStatus:', error);

      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || 'Failed to update pickup';
        toast.error(errorMessage);
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setProcessingCollection(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!order) return <div>No order found.</div>;

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">Order Details</h1>

      {/* Order Information */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
        <div className="grid grid-cols-2 gap-4">
          <p className="dark:text-gray-200">
            <span className="font-semibold">Order ID:</span> {order._id}
          </p>
          <p className="dark:text-gray-200">
            <span className="font-semibold">Name:</span>{' '}
            {order.farmerId.firstName} {order.farmerId.lastName}
          </p>
         
          <p className="dark:text-gray-200">
            <span className="font-semibold">Farm Name:</span>{' '}
            {order.farmerId.farmName}
          </p>
          <p className="dark:text-gray-200">
            <span className="font-semibold">Farm Location:</span>{' '}
            {order.farmerId.farmLocation}
          </p>
          <p className="dark:text-gray-200">
            <span className="font-semibold">Total Cost:</span> {order.totalCost}
          </p>
          <p className="dark:text-gray-200">
            <span className="font-semibold">Tel Number:</span>{' '}
            {order.farmerId.telNumber}
          </p>
          <p className="dark:text-gray-200">
            <span className="font-semibold">Invoice ID:</span>{' '}
            {invoiceId ? invoiceId : 'No invoice created'}
          </p>
          <p className="dark:text-gray-200">
            <span className="font-semibold">Email:</span> {order.farmerId.email}
          </p>
          <p className="dark:text-gray-200">
            <span className="font-semibold">Status:</span> {order.orderStatus}
          </p>
          <p className="dark:text-gray-200">
            <span className="font-semibold">Invoice sent:</span>{' '}
            {order.invoiceGenerated ? 'Yes' : 'No'}
          </p>
          <p className="dark:text-gray-200">
            <span className="font-semibold">Payment Status:</span>{' '}
            {order.paymentStatus}
          </p>
        </div>
      </div>

      {/* Payment Status Update */}
      <div className="flex items-center mb-6">
        <select
          value={paymentStatus}
          onChange={handlePaymentStatusChange}
          className="border border-gray-300 dark:border-gray-600 rounded p-2 mr-4 bg-white dark:bg-gray-700 dark:text-gray-200"
          disabled={payment === 'Paid'}
        >
          <option value="Pending">Pending</option>
          <option value="Paid">Paid</option>
        </select>

        <div className="relative group">
          <button
            onClick={handleUpdatePaymentStatus}
            className="flex items-center bg-blue-400 dark:bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 dark:hover:bg-blue-700 transition disabled:bg-gray-400 dark:disabled:bg-gray-600"
            disabled={isProcessingUpdatePayment || payment === 'Paid'}
          >
            <Save className="w-5 h-5 mr-2" />
            {isProcessingUpdatePayment ? 'Processing...' : 'Update Payment Status'}
          </button>

          {payment === 'Paid' && (
            <div className="absolute left-0 mt-2 w-48 p-2 bg-gray-800 dark:bg-gray-700 text-white text-sm rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
              Payment has already been made, so this action is disabled.
            </div>
          )}
        </div>
      </div>
      {/* awaiting collection update */}
      <div className="flex items-center mb-6">
        <select
          value={awaitingCollection}
          onChange={handleCollectionChange}
          className="border border-gray-300 dark:border-gray-600 rounded p-2 mr-4 bg-white dark:bg-gray-700 dark:text-gray-200"
          disabled={pickup === 'Completed'}
        >
          <option value="Awaiting Collection">Awaiting Collection</option>
          <option value="Completed">Completed</option>
        </select>

        <div className="relative group">
          <button
            onClick={handleUpdateCollectionStatus}
            className="flex items-center bg-blue-400 dark:bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 dark:hover:bg-blue-700 transition disabled:bg-gray-400 dark:disabled:bg-gray-600"
            disabled={pickup === 'Completed'}
          >
            <Save className="w-5 h-5 mr-2" />
            {isProcessingUpdatePayment ? 'Processing...' : 'Update Pickup Status'}
          </button>

          {awaitingCollection=== 'Completed' && (
            <div className="absolute left-0 mt-2 w-48 p-2 bg-gray-800 dark:bg-gray-700 text-white text-sm rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
             collection has already been made, so this action is disabled.
            </div>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="px-4 py-2 text-left dark:text-gray-200">Product</th>
              <th className="px-4 py-2 text-left dark:text-gray-200">Adjusted Quantity</th>
              <th className="px-4 py-2 text-left dark:text-gray-200">Unit Price</th>
              <th className="px-4 py-2 text-left dark:text-gray-200">Total Cost</th>
            </tr>
          </thead>
          <tbody>
            {updatedProducts.map((product, index) => (
              <tr key={product.productId} className="border-b dark:border-gray-700">
                <td className="px-4 py-2 dark:text-gray-200">{product.productName}</td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    value={quantityInputs[index]}
                    onChange={(e) => handleQuantityChange(index, e.target.value)}
                    className="border border-gray-300 dark:border-gray-600 rounded p-1 w-24 dark:bg-gray-700 dark:text-gray-200"
                    min="0"
                  />
                </td>
                <td className="px-4 py-2 dark:text-gray-200">€ {product.unitPrice?.toFixed(2)}</td>
                <td className="px-4 py-2 dark:text-gray-200">€ {product.cost?.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        {order.orderStatus === '' && (
          <button
            onClick={handleSaveChanges}
            className="flex items-center bg-green-400 dark:bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500 dark:hover:bg-green-700 transition"
          >
            <Save className="w-5 h-5 mr-2" />
            Save Changes
          </button>
        )}

        {order.orderStatus === 'Pending' && (
          <button
            onClick={handleApprove}
            className="flex items-center bg-blue-400 dark:bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 dark:hover:bg-blue-700 transition"
            disabled={isProcessing}
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            {isProcessing ? 'Processing...' : 'Approve Order'}
          </button>
        )}

        {order.orderStatus === 'Pending' && (
          <button
            onClick={handleReject}
            className="flex items-center bg-red-400 dark:bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500 dark:hover:bg-red-700 transition"
            disabled={isProcessingReject}
          >
            <XCircle className="w-5 h-5 mr-2" />
            {isProcessingReject ? 'Processing...' : 'Reject Order'}
          </button>
        )}

        {invoiceId && (
          <button
            onClick={handleInvoiceDownload}
            className="flex items-center bg-gray-400 dark:bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500 dark:hover:bg-gray-700 transition"
          >
            <Download className="w-5 h-5 mr-2" />
            Download Invoice PDF
          </button>
        )}

        <a href="/orders">
          <button className="flex items-center bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Return to Orders
          </button>
        </a>
      </div>
      
      {showProcessSteps && (
        <StepIndicator
          currentStep={approvalSteps.findIndex(step => step.status === 'processing')}
          steps={approvalSteps}
        />
      )}
    </div>
  );
};

export default OrderDetails;
