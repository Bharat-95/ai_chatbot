import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

import { useAppDispatch } from '../store/hooks';
import { getDraftDeals, removeDeal } from '../store/actions/dealActions';
import { getInvoiceHistory, submitInvoice } from '../store/actions/invoiceActions';
import { showToast } from '../hooks/useToast';
import { selectCurrentUser } from '../store/reducers/userSlice';
import { getSubscriptionDetails } from '../lib/data';

// Cache expiration time in milliseconds (5 minutes)
const CACHE_EXPIRY_TIME = 5 * 60 * 1000;

export const useInvoiceManagement = () => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState({
    draftDeals: true,
    invoiceHistory: true,
    submitting: false,
    removing: false
  });

  // Track last fetch time
  const lastFetchTime = useRef<{
    draftDeals: number | null;
    invoiceHistory: number | null;
  }>({
    draftDeals: null,
    invoiceHistory: null
  });

  const invoiceItems = useSelector((state: any) => state.deal?.deals || []);
  const submittedInvoices = useSelector((state: any) => state.invoice?.submittedInvoices || []);
  const user = useSelector(selectCurrentUser);
  const subscriptionDetails = getSubscriptionDetails(
    user?.subscriptionPlan || "basic"
  );
  const subscriptionPrice = subscriptionDetails.price;
  const commissionRate = subscriptionDetails.rate;
  const dispatch = useAppDispatch();

  // Calculate totals
  const totalCommission = invoiceItems?.reduce((sum: number, item: any) => sum + item.commission, 0);
  const totalProfit = invoiceItems?.reduce((sum: number, item: any) => sum + item.profit, 0);

  const shouldFetchData = (type: 'draftDeals' | 'invoiceHistory') => {
    // If we don't have data at all, we should fetch
    if ((type === 'draftDeals' && invoiceItems.length === 0) || 
        (type === 'invoiceHistory' && submittedInvoices.length === 0)) {
      return true;
    }

    // If we have data but it's stale (older than cache expiry time), fetch again
    const lastFetch = lastFetchTime.current[type];
    return !lastFetch || Date.now() - lastFetch > CACHE_EXPIRY_TIME;
  };

  const fetchInitialData = async (forceRefresh = false) => {
    try {
      const fetchedToken = "";
      if (!fetchedToken) return;

      setToken(fetchedToken);

      const fetchOperations = [];

      if (forceRefresh || shouldFetchData('draftDeals')) {
        setLoading(prev => ({ ...prev, draftDeals: true }));
        fetchOperations.push(
          dispatch(getDraftDeals({ token: fetchedToken })).then(() => {
            lastFetchTime.current.draftDeals = Date.now();
          })
        );
      }

      if (forceRefresh || shouldFetchData('invoiceHistory')) {
        setLoading(prev => ({ ...prev, invoiceHistory: true }));
        fetchOperations.push(
          dispatch(getInvoiceHistory({ token: fetchedToken })).then(() => {
            lastFetchTime.current.invoiceHistory = Date.now();
          })
        );
      }

      if (fetchOperations.length > 0) {
        await Promise.all(fetchOperations);
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
      showToast({
        title: "Error",
        description: "Failed to load data",
        type: "error"
      });
    } finally {
      setLoading(prev => ({
        ...prev,
        draftDeals: false,
        invoiceHistory: false
      }));
    }
  };

  // Only fetch data on initial mount or when token changes
  useEffect(() => {
    fetchInitialData();
  }, []);

  const refetchData = async () => {
    await fetchInitialData(true);
  };

  const removeItem = async (id: string) => {
    if (!token) return;
    
    try {
      setLoading(prev => ({ ...prev, removing: true }));
      await dispatch(removeDeal({ id, token })).unwrap();
      showToast({
        title: "Item removed",
        description: "This deal was removed successfully"
      });
      // After removal, we should refresh the draft deals
      await fetchInitialData(true);
    } catch (error) {
      console.error("Error removing item:", error);
      showToast({
        title: "Error",
        description: "Failed to remove deal",
        type: "error"
      });
    } finally {
      setLoading(prev => ({ ...prev, removing: false }));
    }
  };

  const submitMonthlyInvoice = async () => {
    if (!token || invoiceItems.length === 0) return;

    try {
      setLoading(prev => ({ ...prev, submitting: true }));
      await dispatch(submitInvoice({ token })).unwrap();
      showToast({
        title: "Invoice submitted successfully",
        description: "These invoices have been submitted successfully"
      });
      // After submission, we need to refresh both draft deals and invoice history
      await fetchInitialData(true);
    } catch (error) {
      console.error("Error submitting invoice:", error);
      showToast({
        title: "Failure",
        description: "Submission failed",
        type: "error"
      });
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  };

  const generateInvoiceReport = () => {
    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    const reportData = {
      month: currentMonth,
      salesperson: `${user?.firstName} ${user?.lastName}`,
      email: user?.email,
      commissionRate: `${Math.round((commissionRate || 0) * 100)}%`,
      items: invoiceItems,
      summary: {
        totalDeals: invoiceItems.length,
        totalProfit,
        totalCommission,
        averageCommissionPerDeal: invoiceItems.length > 0 ? totalCommission / invoiceItems.length : 0
      }
    };

    // Create and download the report
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${currentMonth.toLowerCase().replace(' ', '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return {
    invoiceItems,
    submittedInvoices,
    totalCommission,
    totalProfit,
    loading,
    removeItem,
    submitMonthlyInvoice,
    generateInvoiceReport,
    refetchData,
    user
  };
};