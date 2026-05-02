import { ReceiptText, DollarSign, CheckCircle2, AlertTriangle, CreditCard, Calendar } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { formatCurrency, getMaintenanceFees, updatePaymentStatus, createPayment } from '../data/firebaseData';
import styles from './MaintenanceFeesPage.module.css';
import { useAuth } from '../auth/FirebaseAuthContext';

function statusClass(status) {
  if (status === 'Paid') return styles.paid;
  if (status === 'Overdue') return styles.overdue;
  return styles.unpaid;
}

export function MaintenanceFeesPage() {
  const { user } = useAuth();
  const role = user?.role;

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentReason, setPaymentReason] = useState('Maintenance Fee');

  // Load maintenance fees from Firebase
  useEffect(() => {
    const loadMaintenanceFees = async () => {
      try {
        console.log('Loading maintenance fees for user:', user?.email, 'role:', role);
        
        // Get maintenance fees from Firebase
        const feesData = await getMaintenanceFees(user?.email, role);
        console.log('Maintenance fees data received:', feesData);
        
        // Convert fees to invoice format
        const invoices = feesData.map(fee => ({
          id: fee.id,
          invoiceId: fee.invoiceId || `INV-${fee.id}`,
          description: fee.title || fee.description || 'Maintenance Fee',
          amount: fee.amount,
          dueDate: fee.dueDate,
          status: fee.status,
          type: fee.type || 'Monthly',
          tenantId: fee.tenantId || user?.email,
          tenantName: fee.tenantName || user?.email?.split('@')[0] || 'User',
          paymentMethod: fee.paymentMethod,
          paidDate: fee.paidDate,
          transactionId: fee.transactionId
        }));
        
        // Sort by due date
        const sortedInvoices = invoices.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        setInvoices(sortedInvoices);
        
        console.log('Processed invoices:', sortedInvoices);
        
        // Verify user-specific filtering
        if (role !== 'admin' && invoices.length > 0) {
          const allBelongToUser = invoices.every(invoice => 
            invoice.tenantId?.toLowerCase().trim() === user?.email?.toLowerCase().trim()
          );
          console.log('All invoices belong to current user?', allBelongToUser);
        }
        
      } catch (error) {
        console.error('Error loading maintenance fees:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMaintenanceFees();
  }, [user, role]);

  const stats = useMemo(() => {
    const totalDue = invoices
      .filter((i) => i.status === 'Unpaid' || i.status === 'Overdue')
      .reduce((sum, i) => sum + i.amount, 0);
    const paid = invoices.filter((i) => i.status === 'Paid').reduce((sum, i) => sum + i.amount, 0);
    const overdueCount = invoices.filter((i) => i.status === 'Overdue').length;
    return { totalDue, paid, overdueCount };
  }, [invoices]);

  // Handle payment processing
  const handlePayment = async (invoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentModal(true);
  };

  const processPayment = async (paymentMethod) => {
    if (!selectedInvoice) return;
    
    setPaymentProcessing(true);
    try {
      console.log('Processing payment for invoice:', selectedInvoice.id, 'with method:', paymentMethod);
      
      const finalAmount = customAmount || selectedInvoice.amount || 0;
      const finalReason = paymentReason || 'Maintenance Fee';
      const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
      
      // Create payment record in database
      const paymentData = {
        invoiceId: selectedInvoice.id === 'new-payment' ? `INV-${Date.now()}` : selectedInvoice.invoiceId || selectedInvoice.id,
        description: finalReason,
        amount: finalAmount,
        dueDate: selectedInvoice.dueDate || new Date().toISOString().split('T')[0],
        status: 'Paid',
        type: selectedInvoice.type || 'Custom',
        tenantId: user?.email,
        tenantName: user?.email?.split('@')[0] || 'User',
        paymentMethod: paymentMethod,
        paidDate: new Date().toISOString().split('T')[0],
        transactionId: transactionId
      };
      
      console.log('Creating payment record:', paymentData);
      
      const result = await createPayment(paymentData);
      console.log('Payment creation result:', result);
      
      if (result.ok) {
        // Update local state with the new payment
        const newPayment = {
          id: result.id || paymentData.invoiceId,
          ...paymentData
        };
        
        // Update existing invoice or add new payment
        if (selectedInvoice.id === 'new-payment') {
          // Add as new payment to the list
          setInvoices(prev => [...prev, newPayment]);
        } else {
          // Update existing invoice
          setInvoices(prev => prev.map(inv => 
            inv.id === selectedInvoice.id 
              ? { ...inv, ...newPayment }
              : inv
          ));
        }
        
        setShowPaymentModal(false);
        setSelectedInvoice(null);
        setCustomAmount('');
        setPaymentReason('Maintenance Fee');
        
        // Show success message
        alert(`Payment of ${formatCurrency(finalAmount)} processed successfully! Transaction ID: ${transactionId}`);
        
      } else {
        throw new Error(result.error || 'Payment processing failed');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const payAllDue = () => {
    const today = new Date().toISOString().slice(0, 10);
    setInvoices((prev) =>
      prev.map((i) => {
        if (i.status === 'Paid') return i;
        return { ...i, status: 'Paid', paidDate: today };
      })
    );
  };

  const payInvoice = (invoiceId) => {
    const today = new Date().toISOString().slice(0, 10);
    setInvoices((prev) =>
      prev.map((i) => (i.id === invoiceId ? { ...i, status: 'Paid', paidDate: today } : i))
    );
  };

  if (loading) {
    return <div className={styles.page}>Loading maintenance fees...</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          <div className={styles.h1}>{role === 'admin' ? 'Maintenance Fees (Admin)' : 'Maintenance Fees'}</div>
          <div className={styles.sub}>
            {role === 'admin' ? 'Manage all maintenance fees' : 'Pay your maintenance fees online'}
          </div>
        </div>
        {role !== 'admin' && (
          <Button className={styles.payBtn} onClick={() => handlePayment(invoices.find(i => i.status !== 'Paid') || {
            id: 'new-payment',
            description: 'Make a Payment',
            amount: 0,
            dueDate: new Date().toISOString().split('T')[0],
            status: 'Unpaid',
            type: 'Custom'
          })}>
            <CreditCard size={14} />
            <span>Pay Now</span>
          </Button>
        )}
      </div>

      <div className={styles.statsGrid}>
        <Card
          title="Total Due"
          right={
            <div className={`${styles.statIcon} ${styles.orange}`} aria-hidden="true">
              <ReceiptText size={18} />
            </div>
          }
        >
          <div className={styles.statValue}>{formatCurrency(stats.totalDue)}</div>
          <div className={styles.statHint}>Unpaid + overdue</div>
        </Card>
        <Card
          title="Paid"
          right={
            <div className={`${styles.statIcon} ${styles.green}`} aria-hidden="true">
              <CheckCircle2 size={18} />
            </div>
          }
        >
          <div className={styles.statValue}>{formatCurrency(stats.paid)}</div>
          <div className={styles.statHint}>Payments done</div>
        </Card>
        <Card
          title="Overdue"
          right={
            <div className={`${styles.statIcon} ${styles.red}`} aria-hidden="true">
              <AlertTriangle size={18} />
            </div>
          }
        >
          <div className={styles.statValue}>{stats.overdueCount}</div>
          <div className={styles.statHint}>Invoices overdue</div>
        </Card>
      </div>

      <Card title="Invoices" subtitle="Latest first">
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Due date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((i) => (
                <tr key={i.id}>
                  <td className={styles.bold}>{i.description}</td>
                  <td>{i.dueDate}</td>
                  <td>{formatCurrency(i.amount)}</td>
                  <td>
                    <span className={`${styles.statusPill} ${statusClass(i.status)}`}>{i.status}</span>
                  </td>
                  <td>
                    {role === 'admin' ? (
                      <select
                        className={styles.adminSelect}
                        value={i.status}
                        onChange={(e) => {
                          const nextStatus = e.target.value;
                          setInvoices((prev) =>
                            prev.map((x) =>
                              x.id === i.id
                                ? { ...x, status: nextStatus, paidDate: nextStatus === 'Paid' ? new Date().toISOString().slice(0, 10) : x.paidDate }
                                : x
                            )
                          );
                        }}
                      >
                        <option value="Paid">Paid</option>
                        <option value="Unpaid">Unpaid</option>
                        <option value="Overdue">Overdue</option>
                      </select>
                    ) : i.status === 'Paid' ? (
                      <span className={styles.mutedText}>Paid</span>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => handlePayment(i)}>
                        Pay Now
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Make Payment</h3>
            
            <div className={styles.paymentForm}>
              <div className={styles.formGroup}>
                <label>Payment Reason</label>
                <input
                  type="text"
                  value={paymentReason}
                  onChange={(e) => setPaymentReason(e.target.value)}
                  placeholder="What is this payment for?"
                  className={styles.paymentInput}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Amount (₹)</label>
                <input
                  type="number"
                  value={customAmount || selectedInvoice.amount || ''}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="Enter amount"
                  className={styles.paymentInput}
                  min="1"
                />
              </div>
              
              {selectedInvoice.id !== 'new-payment' && (
                <div className={styles.invoiceInfo}>
                  <small>Paying for: {selectedInvoice.description}</small>
                  {selectedInvoice.amount > 0 && (
                    <small>Due amount: {formatCurrency(selectedInvoice.amount)}</small>
                  )}
                </div>
              )}
            </div>

            <div className={styles.paymentMethods}>
              <h4>Choose Payment Method</h4>
              <div className={styles.paymentOptions}>
                <div 
                  className={styles.paymentOption}
                  onClick={() => processPayment('credit-card')}
                  disabled={paymentProcessing}
                >
                  <CreditCard size={24} />
                  <div className={styles.paymentOptionContent}>
                    <span className={styles.paymentOptionTitle}>Credit/Debit Card</span>
                    <span className={styles.paymentOptionDesc}>Pay with Visa, Mastercard, Rupay</span>
                  </div>
                </div>
                <div 
                  className={styles.paymentOption}
                  onClick={() => processPayment('upi')}
                  disabled={paymentProcessing}
                >
                  <DollarSign size={24} />
                  <div className={styles.paymentOptionContent}>
                    <span className={styles.paymentOptionTitle}>UPI Payment</span>
                    <span className={styles.paymentOptionDesc}>Pay with Google Pay, PhonePe, Paytm</span>
                  </div>
                </div>
                <div 
                  className={styles.paymentOption}
                  onClick={() => processPayment('net-banking')}
                  disabled={paymentProcessing}
                >
                  <ReceiptText size={24} />
                  <div className={styles.paymentOptionContent}>
                    <span className={styles.paymentOptionTitle}>Net Banking</span>
                    <span className={styles.paymentOptionDesc}>Pay from your bank account</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.modalActions}>
              <Button 
                variant="ghost" 
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedInvoice(null);
                  setCustomAmount('');
                  setPaymentReason('Maintenance Fee');
                }}
                disabled={paymentProcessing}
              >
                Cancel
              </Button>
            </div>

            {paymentProcessing && (
              <div className={styles.paymentProcessing}>
                <div className={styles.spinner}></div>
                <div>
                  <span>Processing payment...</span>
                  <small>Please wait while we process your payment</small>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

