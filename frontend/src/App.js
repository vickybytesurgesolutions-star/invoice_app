import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Textarea } from "./components/ui/textarea";
import { Separator } from "./components/ui/separator";
import { Trash2, Plus, FileText, Calculator, Edit, Eye, Settings, Building, Printer } from "lucide-react";
import { toast, Toaster } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Company Settings Component
const CompanySettings = () => {
  const [company, setCompany] = useState({
    company_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'India',
    phone: '',
    email: '',
    website: '',
    gstin: '',
    logo_url: '',
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    branch: '',
    branch_code: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCompanyDetails();
  }, []);

  const fetchCompanyDetails = async () => {
    try {
      const response = await axios.get(`${API}/company`);
      if (response.data) {
        setCompany(response.data);
      }
    } catch (error) {
      console.error('Error fetching company details:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await axios.post(`${API}/company`, company);
      toast.success("Company details saved successfully!");
    } catch (error) {
      console.error('Error saving company details:', error);
      toast.error("Failed to save company details");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Company Settings</h1>
        <p className="text-gray-600">Configure your company details for invoices</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Company Name</Label>
                <Input
                  value={company.company_name}
                  onChange={(e) => setCompany({...company, company_name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label>GSTIN</Label>
                <Input
                  value={company.gstin}
                  onChange={(e) => setCompany({...company, gstin: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Address Line 1</Label>
                <Input
                  value={company.address_line1}
                  onChange={(e) => setCompany({...company, address_line1: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label>Address Line 2</Label>
                <Input
                  value={company.address_line2}
                  onChange={(e) => setCompany({...company, address_line2: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>City</Label>
                <Input
                  value={company.city}
                  onChange={(e) => setCompany({...company, city: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label>State</Label>
                <Input
                  value={company.state}
                  onChange={(e) => setCompany({...company, state: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label>ZIP Code</Label>
                <Input
                  value={company.zip_code}
                  onChange={(e) => setCompany({...company, zip_code: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Phone</Label>
                <Input
                  value={company.phone}
                  onChange={(e) => setCompany({...company, phone: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={company.email}
                  onChange={(e) => setCompany({...company, email: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label>Website</Label>
                <Input
                  value={company.website}
                  onChange={(e) => setCompany({...company, website: e.target.value})}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bank Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Bank Name</Label>
                <Input
                  value={company.bank_name}
                  onChange={(e) => setCompany({...company, bank_name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label>Account Number</Label>
                <Input
                  value={company.account_number}
                  onChange={(e) => setCompany({...company, account_number: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>IFSC Code</Label>
                <Input
                  value={company.ifsc_code}
                  onChange={(e) => setCompany({...company, ifsc_code: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label>Branch</Label>
                <Input
                  value={company.branch}
                  onChange={(e) => setCompany({...company, branch: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label>Branch Code</Label>
                <Input
                  value={company.branch_code}
                  onChange={(e) => setCompany({...company, branch_code: e.target.value})}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Company Details'}
        </Button>
      </form>
    </div>
  );
};

// Invoice Form Component (Create/Edit)
const InvoiceForm = ({ isEdit = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoiceData, setInvoiceData] = useState({
    invoice_number: '',
    due_date: '',
    payment_terms: '30 days',
    po_number: '',
    place_of_supply: '',
    customer: {
      name: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      zip_code: '',
      country: 'India',
      gstin: '',
      phone: '',
      email: ''
    },
    line_items: [{ description: '', hsn_sac: '', quantity: 1, rate: 0, amount: 0 }],
    service_charges: {
      description: 'Service Charges',
      hsn_sac: '998314',
      amount: 0,
      cgst_rate: 9.0,
      sgst_rate: 9.0
    },
    terms_conditions: 'Payment should be made within the specified due date. Interest @24% will be charged on delayed payments.',
    notes: 'This is a system-generated invoice and has been digitally signed. No physical signature is required. The GST is applied on the service charges.'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      fetchInvoice();
    } else {
      generateInvoiceNumber();
      setDefaultDueDate();
    }
  }, [isEdit, id]);

  const fetchInvoice = async () => {
    try {
      const response = await axios.get(`${API}/invoices/${id}`);
      const invoice = response.data;
      setInvoiceData({
        ...invoice,
        due_date: new Date(invoice.due_date).toISOString().split('T')[0],
      });
    } catch (error) {
      console.error('Error fetching invoice:', error);
      toast.error("Failed to fetch invoice");
      navigate('/');
    }
  };

  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const invoiceNum = `INV-${year}${month}${day}-${random}`;
    setInvoiceData(prev => ({ ...prev, invoice_number: invoiceNum }));
  };

  const setDefaultDueDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 30); // 30 days from now
    setInvoiceData(prev => ({ ...prev, due_date: date.toISOString().split('T')[0] }));
  };

  const updateLineItemAmount = (index, field, value) => {
    const newLineItems = [...invoiceData.line_items];
    newLineItems[index][field] = value;
    
    if (field === 'quantity' || field === 'rate') {
      newLineItems[index].amount = newLineItems[index].quantity * newLineItems[index].rate;
    }
    
    setInvoiceData(prev => ({ ...prev, line_items: newLineItems }));
  };

  const addLineItem = () => {
    setInvoiceData(prev => ({
      ...prev,
      line_items: [...prev.line_items, { description: '', hsn_sac: '', quantity: 1, rate: 0, amount: 0 }]
    }));
  };

  const removeLineItem = (index) => {
    if (invoiceData.line_items.length > 1) {
      setInvoiceData(prev => ({
        ...prev,
        line_items: prev.line_items.filter((_, i) => i !== index)
      }));
    }
  };

  const calculateTotals = () => {
    const subtotal = invoiceData.line_items.reduce((sum, item) => sum + item.amount, 0);
    const cgstAmount = (invoiceData.service_charges.amount * invoiceData.service_charges.cgst_rate) / 100;
    const sgstAmount = (invoiceData.service_charges.amount * invoiceData.service_charges.sgst_rate) / 100;
    const totalGst = cgstAmount + sgstAmount;
    const grandTotal = subtotal + invoiceData.service_charges.amount + totalGst;
    
    return {
      subtotal,
      serviceCharge: invoiceData.service_charges.amount,
      cgstAmount,
      sgstAmount,
      totalGst,
      grandTotal
    };
  };

  const totals = calculateTotals();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submitData = {
        ...invoiceData,
        due_date: new Date(invoiceData.due_date).toISOString()
      };

      if (isEdit) {
        await axios.put(`${API}/invoices/${id}`, submitData);
        toast.success("Invoice updated successfully!");
      } else {
        await axios.post(`${API}/invoices`, submitData);
        toast.success("Invoice created successfully!");
      }
      
      navigate('/');
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast.error("Failed to save invoice");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isEdit ? 'Edit Invoice' : 'Create Tax Invoice'}
        </h1>
        <p className="text-gray-600">Professional tax invoice with CGST/SGST breakdown</p>
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
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label>Invoice Number</Label>
                <Input
                  value={invoiceData.invoice_number}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, invoice_number: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={invoiceData.due_date}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, due_date: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label>Payment Terms</Label>
                <Input
                  value={invoiceData.payment_terms}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, payment_terms: e.target.value }))}
                />
              </div>
              <div>
                <Label>P.O. Number</Label>
                <Input
                  value={invoiceData.po_number}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, po_number: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>Place of Supply</Label>
              <Input
                value={invoiceData.place_of_supply}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, place_of_supply: e.target.value }))}
                placeholder="State/Province (Code)"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Customer Details */}
        <Card>
          <CardHeader>
            <CardTitle>Bill To - Customer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Customer Name</Label>
                <Input
                  value={invoiceData.customer.name}
                  onChange={(e) => setInvoiceData(prev => ({
                    ...prev,
                    customer: { ...prev.customer, name: e.target.value }
                  }))}
                  required
                />
              </div>
              <div>
                <Label>GSTIN</Label>
                <Input
                  value={invoiceData.customer.gstin}
                  onChange={(e) => setInvoiceData(prev => ({
                    ...prev,
                    customer: { ...prev.customer, gstin: e.target.value }
                  }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Address Line 1</Label>
                <Input
                  value={invoiceData.customer.address_line1}
                  onChange={(e) => setInvoiceData(prev => ({
                    ...prev,
                    customer: { ...prev.customer, address_line1: e.target.value }
                  }))}
                  required
                />
              </div>
              <div>
                <Label>Address Line 2</Label>
                <Input
                  value={invoiceData.customer.address_line2}
                  onChange={(e) => setInvoiceData(prev => ({
                    ...prev,
                    customer: { ...prev.customer, address_line2: e.target.value }
                  }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label>City</Label>
                <Input
                  value={invoiceData.customer.city}
                  onChange={(e) => setInvoiceData(prev => ({
                    ...prev,
                    customer: { ...prev.customer, city: e.target.value }
                  }))}
                  required
                />
              </div>
              <div>
                <Label>State</Label>
                <Input
                  value={invoiceData.customer.state}
                  onChange={(e) => setInvoiceData(prev => ({
                    ...prev,
                    customer: { ...prev.customer, state: e.target.value }
                  }))}
                  required
                />
              </div>
              <div>
                <Label>ZIP Code</Label>
                <Input
                  value={invoiceData.customer.zip_code}
                  onChange={(e) => setInvoiceData(prev => ({
                    ...prev,
                    customer: { ...prev.customer, zip_code: e.target.value }
                  }))}
                  required
                />
              </div>
              <div>
                <Label>Country</Label>
                <Input
                  value={invoiceData.customer.country}
                  onChange={(e) => setInvoiceData(prev => ({
                    ...prev,
                    customer: { ...prev.customer, country: e.target.value }
                  }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phone</Label>
                <Input
                  value={invoiceData.customer.phone}
                  onChange={(e) => setInvoiceData(prev => ({
                    ...prev,
                    customer: { ...prev.customer, phone: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={invoiceData.customer.email}
                  onChange={(e) => setInvoiceData(prev => ({
                    ...prev,
                    customer: { ...prev.customer, email: e.target.value }
                  }))}
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
              <div className="grid grid-cols-12 gap-4 font-semibold text-sm">
                <div className="col-span-1">#</div>
                <div className="col-span-4">Item & Description</div>
                <div className="col-span-2">HSN/SAC</div>
                <div className="col-span-1">Qty</div>
                <div className="col-span-2">Rate</div>
                <div className="col-span-2">Amount</div>
              </div>
              {invoiceData.line_items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-1">{index + 1}</div>
                  <div className="col-span-4">
                    <Input
                      value={item.description}
                      onChange={(e) => updateLineItemAmount(index, 'description', e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      value={item.hsn_sac}
                      onChange={(e) => updateLineItemAmount(index, 'hsn_sac', e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-span-1">
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateLineItemAmount(index, 'quantity', parseInt(e.target.value) || 0)}
                      min="1"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={item.rate}
                      onChange={(e) => updateLineItemAmount(index, 'rate', parseFloat(e.target.value) || 0)}
                      min="0"
                      required
                    />
                  </div>
                  <div className="col-span-1">
                    <Input
                      type="number"
                      step="0.01"
                      value={item.amount.toFixed(2)}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeLineItem(index)}
                      disabled={invoiceData.line_items.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addLineItem} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Line Item
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Service Charges */}
        <Card>
          <CardHeader>
            <CardTitle>Service Charges (CGST/SGST Applicable)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-5 gap-4">
              <div>
                <Label>Description</Label>
                <Input
                  value={invoiceData.service_charges.description}
                  onChange={(e) => setInvoiceData(prev => ({
                    ...prev,
                    service_charges: { ...prev.service_charges, description: e.target.value }
                  }))}
                  required
                />
              </div>
              <div>
                <Label>HSN/SAC</Label>
                <Input
                  value={invoiceData.service_charges.hsn_sac}
                  onChange={(e) => setInvoiceData(prev => ({
                    ...prev,
                    service_charges: { ...prev.service_charges, hsn_sac: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label>Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={invoiceData.service_charges.amount}
                  onChange={(e) => setInvoiceData(prev => ({
                    ...prev,
                    service_charges: { ...prev.service_charges, amount: parseFloat(e.target.value) || 0 }
                  }))}
                  min="0"
                  required
                />
              </div>
              <div>
                <Label>CGST Rate (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={invoiceData.service_charges.cgst_rate}
                  onChange={(e) => setInvoiceData(prev => ({
                    ...prev,
                    service_charges: { ...prev.service_charges, cgst_rate: parseFloat(e.target.value) || 0 }
                  }))}
                  min="0"
                />
              </div>
              <div>
                <Label>SGST Rate (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={invoiceData.service_charges.sgst_rate}
                  onChange={(e) => setInvoiceData(prev => ({
                    ...prev,
                    service_charges: { ...prev.service_charges, sgst_rate: parseFloat(e.target.value) || 0 }
                  }))}
                  min="0"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms & Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Terms & Conditions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Terms & Conditions</Label>
              <Textarea
                value={invoiceData.terms_conditions}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, terms_conditions: e.target.value }))}
                rows={3}
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={invoiceData.notes}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Totals Preview */}
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
                <span>Sub Total:</span>
                <span>₹{totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Service Charges:</span>
                <span>₹{totals.serviceCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>CGST ({invoiceData.service_charges.cgst_rate}%):</span>
                <span>₹{totals.cgstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>SGST ({invoiceData.service_charges.sgst_rate}%):</span>
                <span>₹{totals.sgstAmount.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Grand Total:</span>
                <span>₹{totals.grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Invoice' : 'Create Invoice')}
        </Button>
      </form>
    </div>
  );
};

// Invoice View Component
const InvoiceView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoiceAndCompany();
  }, [id]);

  const fetchInvoiceAndCompany = async () => {
    try {
      const [invoiceResponse, companyResponse] = await Promise.all([
        axios.get(`${API}/invoices/${id}`),
        axios.get(`${API}/company`)
      ]);
      setInvoice(invoiceResponse.data);
      setCompany(companyResponse.data);
    } catch (error) {
      console.error('Error fetching invoice:', error);
      toast.error("Failed to fetch invoice");
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto p-6 text-center">Loading invoice...</div>;
  }

  if (!invoice) {
    return <div className="max-w-4xl mx-auto p-6 text-center">Invoice not found</div>;
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Print/Edit Actions */}
      <div className="no-print flex justify-end gap-2 mb-6">
        <Button onClick={handlePrint} variant="outline">
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
        <Button onClick={() => navigate(`/edit/${id}`)} variant="outline">
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button onClick={() => navigate('/')}>
          Back to List
        </Button>
      </div>

      {/* Invoice Content */}
      <div className="bg-white p-8 border border-gray-200 invoice-print">
        {/* Company Header */}
        {company && (
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{company.company_name}</h1>
            <div className="text-sm text-gray-600 space-y-1">
              <p>{company.address_line1}</p>
              {company.address_line2 && <p>{company.address_line2}</p>}
              <p>{company.city}, {company.state}, {company.zip_code}</p>
              <p>{company.country}</p>
              <p>Phone: {company.phone} | Email: {company.email}</p>
              {company.website && <p>Website: {company.website}</p>}
              <p>GSTIN: {company.gstin}</p>
            </div>
          </div>
        )}

        <Separator className="my-6" />

        {/* Invoice Title & Details */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">TAX INVOICE</h2>
            <div className="text-sm space-y-1">
              <p><strong>Invoice#:</strong> {invoice.invoice_number}</p>
              <p><strong>Invoice Date:</strong> {new Date(invoice.invoice_date).toLocaleDateString()}</p>
              <p><strong>Terms:</strong> {invoice.payment_terms}</p>
              <p><strong>Due Date:</strong> {new Date(invoice.due_date).toLocaleDateString()}</p>
              {invoice.po_number && <p><strong>P.O.#:</strong> {invoice.po_number}</p>}
              <p><strong>Place of Supply:</strong> {invoice.place_of_supply}</p>
            </div>
          </div>
        </div>

        {/* Bill To */}
        <div className="mb-6">
          <h3 className="font-bold text-gray-900 mb-2">Bill To</h3>
          <div className="text-sm text-gray-700 space-y-1">
            <p className="font-semibold">{invoice.customer.name}</p>
            <p>{invoice.customer.address_line1}</p>
            {invoice.customer.address_line2 && <p>{invoice.customer.address_line2}</p>}
            <p>{invoice.customer.city}, {invoice.customer.state}, {invoice.customer.zip_code}</p>
            <p>{invoice.customer.country}</p>
            {invoice.customer.gstin && <p>GSTIN: {invoice.customer.gstin}</p>}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mb-6">
          <table className="w-full border border-gray-300 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="border border-gray-300 p-2 text-left">#</th>
                <th className="border border-gray-300 p-2 text-left">Item & Description</th>
                <th className="border border-gray-300 p-2 text-left">HSN/SAC</th>
                <th className="border border-gray-300 p-2 text-center">Qty</th>
                <th className="border border-gray-300 p-2 text-right">Rate</th>
                <th className="border border-gray-300 p-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.line_items.map((item, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 p-2">{index + 1}</td>
                  <td className="border border-gray-300 p-2">{item.description}</td>
                  <td className="border border-gray-300 p-2">{item.hsn_sac}</td>
                  <td className="border border-gray-300 p-2 text-center">{item.quantity}</td>
                  <td className="border border-gray-300 p-2 text-right">₹{item.rate.toFixed(2)}</td>
                  <td className="border border-gray-300 p-2 text-right">₹{item.amount.toFixed(2)}</td>
                </tr>
              ))}
              <tr>
                <td className="border border-gray-300 p-2">{invoice.line_items.length + 1}</td>
                <td className="border border-gray-300 p-2">{invoice.service_charges.description}</td>
                <td className="border border-gray-300 p-2">{invoice.service_charges.hsn_sac}</td>
                <td className="border border-gray-300 p-2 text-center">1</td>
                <td className="border border-gray-300 p-2 text-right">₹{invoice.service_charges.amount.toFixed(2)}</td>
                <td className="border border-gray-300 p-2 text-right">₹{invoice.service_charges.amount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="flex justify-between mb-6">
          <div className="w-1/2">
            <h4 className="font-bold mb-2">Total In Words</h4>
            <p className="text-sm font-medium">{invoice.totals.amount_in_words}</p>
          </div>
          <div className="w-1/3">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Sub Total</span>
                <span>₹{invoice.totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>CGST ({invoice.service_charges.cgst_rate}%)</span>
                <span>₹{invoice.totals.total_cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>SGST ({invoice.service_charges.sgst_rate}%)</span>
                <span>₹{invoice.totals.total_sgst.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-300 pt-2">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>₹{invoice.totals.grand_total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Balance Due</span>
                  <span>₹{invoice.totals.grand_total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bank Details */}
        {company && (
          <div className="mb-6">
            <h4 className="font-bold mb-2">Company Bank Details:</h4>
            <div className="text-sm space-y-1">
              <p>{company.company_name}</p>
              <p>A/C No.: {company.account_number}</p>
              <p>IFSC Code: {company.ifsc_code}</p>
              <p>Bank Name: {company.bank_name}</p>
              <p>Branch: {company.branch}</p>
              {company.branch_code && <p>Branch Code: {company.branch_code}</p>}
            </div>
          </div>
        )}

        {/* Terms & Conditions */}
        <div className="mb-4">
          <h4 className="font-bold mb-2">Terms & Conditions</h4>
          <p className="text-sm text-gray-700">{invoice.terms_conditions}</p>
        </div>

        {/* Notes */}
        <div className="text-sm text-gray-600">
          <h4 className="font-bold mb-1">Note:</h4>
          <p>{invoice.notes}</p>
          <p className="mt-2">Thanks for your business.</p>
        </div>
      </div>
    </div>
  );
};

// Invoice List Component
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
    return <div className="max-w-6xl mx-auto p-6 text-center">Loading invoices...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Tax Invoice List</h1>
        <Link to="/create">
          <Button>
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
            <p className="text-gray-500 mb-4">Get started by creating your first tax invoice</p>
            <Link to="/create">
              <Button>Create Invoice</Button>
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
                      <h3 className="text-lg font-semibold">{invoice.invoice_number}</h3>
                      <span className="text-sm text-gray-500">
                        {new Date(invoice.invoice_date).toLocaleDateString()}
                      </span>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                        Due: {new Date(invoice.due_date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-1">
                      <strong>Customer:</strong> {invoice.customer.name}
                    </p>
                    <p className="text-gray-600 text-sm mb-3">
                      <strong>Place of Supply:</strong> {invoice.place_of_supply}
                    </p>
                    <div className="grid grid-cols-5 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Subtotal:</span>
                        <p className="font-medium">₹{invoice.totals.subtotal.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Service:</span>
                        <p className="font-medium">₹{invoice.totals.service_charge.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">CGST:</span>
                        <p className="font-medium">₹{invoice.totals.total_cgst.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">SGST:</span>
                        <p className="font-medium">₹{invoice.totals.total_sgst.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Total:</span>
                        <p className="font-bold text-lg">₹{invoice.totals.grand_total.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 flex gap-2">
                    <Link to={`/view/${invoice.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link to={`/edit/${invoice.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteInvoice(invoice.id)}
                      className="text-red-600 hover:text-red-700"
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

// Navigation Component
const Navigation = () => {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-gray-900">
          Professional Tax Invoice App
        </Link>
        <div className="flex gap-4">
          <Link to="/">
            <Button variant="ghost">Invoices</Button>
          </Link>
          <Link to="/create">
            <Button variant="ghost">Create Invoice</Button>
          </Link>
          <Link to="/settings">
            <Button variant="ghost">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
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
          <Route path="/edit/:id" element={<InvoiceForm isEdit={true} />} />
          <Route path="/view/:id" element={<InvoiceView />} />
          <Route path="/settings" element={<CompanySettings />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;