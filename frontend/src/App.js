import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import axios from "axios";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Textarea } from "./components/ui/textarea";
import { Trash2, Plus, FileText, Calculator } from "lucide-react";
import { toast, Toaster } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const InvoiceForm = () => {
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [customer, setCustomer] = useState({
    name: '',
    address: '',
    gst_number: '',
    phone: '',
    email: ''
  });
  const [lineItems, setLineItems] = useState([
    { description: '', quantity: 1, rate: 0, amount: 0 }
  ]);
  const [serviceCharge, setServiceCharge] = useState({
    description: 'Service Charges',
    amount: 0,
    gst_rate: 18,
    gst_amount: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate line item amount when quantity or rate changes
  const updateLineItemAmount = (index, field, value) => {
    const newLineItems = [...lineItems];
    newLineItems[index][field] = value;
    
    if (field === 'quantity' || field === 'rate') {
      newLineItems[index].amount = newLineItems[index].quantity * newLineItems[index].rate;
    }
    
    setLineItems(newLineItems);
  };

  // Add new line item
  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, rate: 0, amount: 0 }]);
  };

  // Remove line item
  const removeLineItem = (index) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const gstOnService = (serviceCharge.amount * serviceCharge.gst_rate) / 100;
    const grandTotal = subtotal + serviceCharge.amount + gstOnService;
    
    return {
      subtotal,
      serviceCharge: serviceCharge.amount,
      gstOnService,
      grandTotal
    };
  };

  const totals = calculateTotals();

  // Generate invoice number
  useEffect(() => {
    const generateInvoiceNumber = () => {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      return `INV-${year}${month}${day}-${random}`;
    };
    
    if (!invoiceNumber) {
      setInvoiceNumber(generateInvoiceNumber());
    }
  }, [invoiceNumber]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const invoiceData = {
        invoice_number: invoiceNumber,
        customer,
        line_items: lineItems,
        service_charges: serviceCharge
      };

      const response = await axios.post(`${API}/invoices`, invoiceData);
      toast.success("Invoice created successfully!");
      
      // Reset form
      setInvoiceNumber('');
      setCustomer({ name: '', address: '', gst_number: '', phone: '', email: '' });
      setLineItems([{ description: '', quantity: 1, rate: 0, amount: 0 }]);
      setServiceCharge({ description: 'Service Charges', amount: 0, gst_rate: 18, gst_amount: 0 });
      
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error("Failed to create invoice. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Invoice</h1>
        <p className="text-gray-600">Generate professional invoices with GST on service charges</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Invoice Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Invoice Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoice_number">Invoice Number</Label>
                <Input
                  id="invoice_number"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  required
                  data-testid="invoice-number-input"
                />
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  data-testid="invoice-date-input"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Details */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer_name">Customer Name</Label>
                <Input
                  id="customer_name"
                  value={customer.name}
                  onChange={(e) => setCustomer({...customer, name: e.target.value})}
                  required
                  data-testid="customer-name-input"
                />
              </div>
              <div>
                <Label htmlFor="gst_number">GST Number</Label>
                <Input
                  id="gst_number"
                  value={customer.gst_number}
                  onChange={(e) => setCustomer({...customer, gst_number: e.target.value})}
                  data-testid="customer-gst-input"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={customer.address}
                onChange={(e) => setCustomer({...customer, address: e.target.value})}
                required
                data-testid="customer-address-input"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={customer.phone}
                  onChange={(e) => setCustomer({...customer, phone: e.target.value})}
                  data-testid="customer-phone-input"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={customer.email}
                  onChange={(e) => setCustomer({...customer, email: e.target.value})}
                  data-testid="customer-email-input"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card>
          <CardHeader>
            <CardTitle>Line Items (No GST)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lineItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 items-end">
                  <div className="col-span-5">
                    <Label>Description</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateLineItemAmount(index, 'description', e.target.value)}
                      required
                      data-testid={`line-item-description-${index}`}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateLineItemAmount(index, 'quantity', parseInt(e.target.value) || 0)}
                      min="1"
                      required
                      data-testid={`line-item-quantity-${index}`}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Rate</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.rate}
                      onChange={(e) => updateLineItemAmount(index, 'rate', parseFloat(e.target.value) || 0)}
                      min="0"
                      required
                      data-testid={`line-item-rate-${index}`}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.amount.toFixed(2)}
                      readOnly
                      className="bg-gray-50"
                      data-testid={`line-item-amount-${index}`}
                    />
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeLineItem(index)}
                      disabled={lineItems.length === 1}
                      data-testid={`remove-line-item-${index}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addLineItem}
                className="w-full"
                data-testid="add-line-item-btn"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Line Item
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Service Charges */}
        <Card>
          <CardHeader>
            <CardTitle>Service Charges (GST Applicable)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="service_description">Description</Label>
                <Input
                  id="service_description"
                  value={serviceCharge.description}
                  onChange={(e) => setServiceCharge({...serviceCharge, description: e.target.value})}
                  required
                  data-testid="service-description-input"
                />
              </div>
              <div>
                <Label htmlFor="service_amount">Amount</Label>
                <Input
                  id="service_amount"
                  type="number"
                  step="0.01"
                  value={serviceCharge.amount}
                  onChange={(e) => setServiceCharge({...serviceCharge, amount: parseFloat(e.target.value) || 0})}
                  min="0"
                  required
                  data-testid="service-amount-input"
                />
              </div>
              <div>
                <Label htmlFor="gst_rate">GST Rate (%)</Label>
                <Input
                  id="gst_rate"
                  type="number"
                  step="0.01"
                  value={serviceCharge.gst_rate}
                  onChange={(e) => setServiceCharge({...serviceCharge, gst_rate: parseFloat(e.target.value) || 0})}
                  min="0"
                  max="100"
                  required
                  data-testid="gst-rate-input"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Totals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Invoice Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal (No GST):</span>
                <span data-testid="subtotal-display">₹{totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Service Charges:</span>
                <span data-testid="service-charge-display">₹{totals.serviceCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST on Service ({serviceCharge.gst_rate}%):</span>
                <span data-testid="gst-amount-display">₹{totals.gstOnService.toFixed(2)}</span>
              </div>
              <hr />
              <div className="flex justify-between font-bold text-lg">
                <span>Grand Total:</span>
                <span data-testid="grand-total-display">₹{totals.grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
          data-testid="create-invoice-btn"
        >
          {isSubmitting ? 'Creating Invoice...' : 'Create Invoice'}
        </Button>
      </form>
    </div>
  );
};

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    try {
      const response = await axios.get(`${API}/invoices`);
      setInvoices(response.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error("Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  };

  const deleteInvoice = async (invoiceId) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await axios.delete(`${API}/invoices/${invoiceId}`);
        toast.success("Invoice deleted successfully");
        fetchInvoices();
      } catch (error) {
        console.error('Error deleting invoice:', error);
        toast.error("Failed to delete invoice");
      }
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center">Loading invoices...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Invoice List</h1>
        <Link to="/create">
          <Button data-testid="create-new-invoice-btn">
            <Plus className="h-4 w-4 mr-2" />
            Create New Invoice
          </Button>
        </Link>
      </div>

      {invoices.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first invoice</p>
            <Link to="/create">
              <Button data-testid="create-first-invoice-btn">Create Invoice</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {invoices.map((invoice) => (
            <Card key={invoice.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-lg font-semibold" data-testid={`invoice-number-${invoice.id}`}>
                        {invoice.invoice_number}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {new Date(invoice.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-1" data-testid={`customer-name-${invoice.id}`}>
                      <strong>Customer:</strong> {invoice.customer.name}
                    </p>
                    <p className="text-gray-600 text-sm mb-3">
                      <strong>Address:</strong> {invoice.customer.address}
                    </p>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Subtotal:</span>
                        <p className="font-medium" data-testid={`invoice-subtotal-${invoice.id}`}>
                          ₹{invoice.totals.subtotal.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Service:</span>
                        <p className="font-medium">₹{invoice.totals.service_charge.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">GST:</span>
                        <p className="font-medium">₹{invoice.totals.gst_on_service.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Total:</span>
                        <p className="font-bold text-lg" data-testid={`invoice-total-${invoice.id}`}>
                          ₹{invoice.totals.grand_total.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteInvoice(invoice.id)}
                      className="text-red-600 hover:text-red-700"
                      data-testid={`delete-invoice-${invoice.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const Navigation = () => {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-gray-900">
          Invoice GST App
        </Link>
        <div className="flex gap-4">
          <Link to="/">
            <Button variant="ghost" data-testid="nav-invoices-btn">Invoices</Button>
          </Link>
          <Link to="/create">
            <Button variant="ghost" data-testid="nav-create-btn">Create Invoice</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <div className="App min-h-screen bg-gray-50">
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<InvoiceList />} />
          <Route path="/create" element={<InvoiceForm />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;