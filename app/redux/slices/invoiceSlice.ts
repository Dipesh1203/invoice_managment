import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface InvoiceTaxDetail {
  taxType: string; // CGST/SGST/IGST
  percentage: string;
  amount: string;
}

export interface InvoiceItem {
  id: string;
  description?: string;
  quantity?: string;
  rate?: string;
  taxableValue?: string;
  gstRate?: string;
  gstAmount?: string;
  discount?: string;
  amount?: string;
}

export interface ChargesAndTotals {
  makingCharges?: string;
  debitCardCharges?: string;
  shippingCharges?: string;
  taxableAmount?: string;
  taxDetails?: InvoiceTaxDetail[];
  roundedTotal?: string;
  amountPayable?: string;
  totalAmountDue?: string;
  totalItemsQty?: string;
}

export interface InvoiceInformation {
  consignee?: string;
  consigneePhone?: string;
  consigneeAddress?: string;
  gstin?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  placeOfSupply?: string;
  companyName?: string;
  companyAddress?: string;
  companyGSTIN?: string;
  companyPhone?: string;
  companyEmail?: string;
}

export interface InvoiceData {
  invoiceInformation?: InvoiceInformation;
  items?: InvoiceItem[];
  chargesAndTotals?: ChargesAndTotals;
  bankDetails?: BankDetails;
  notes?: string;
  terms?: string;
}

interface BankDetails {
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  branch?: string;
  beneficiaryName?: string;
}

interface InvoiceState {
  invoiceData?: InvoiceData[];
}

const initialState: InvoiceState = {
  invoiceData: [],
};

const invoicesSlice = createSlice({
  name: "invoices",
  initialState,
  reducers: {
    addInvoice: (state, action: PayloadAction<InvoiceData>) => {
      state.invoiceData?.push(action.payload);
    },

    updateInvoiceInformation: (
      state,
      action: PayloadAction<{
        invoiceIndex: number;
        data: Partial<InvoiceInformation>;
      }>
    ) => {
      const { invoiceIndex, data } = action.payload;
      const invoice = state.invoiceData?.[invoiceIndex];
      if (!invoice) return;

      invoice.invoiceInformation = {
        ...invoice.invoiceInformation,
        ...data,
      };
    },

    addItem: (
      state,
      action: PayloadAction<{ invoiceIndex: number; item: InvoiceItem }>
    ) => {
      const { invoiceIndex, item } = action.payload;
      const invoice = state.invoiceData?.[invoiceIndex];
      if (!invoice) return;
      invoice.items = [...(invoice.items || []), item];
    },

    updateItem: (
      state,
      action: PayloadAction<{
        invoiceIndex: number;
        itemIndex: number;
        field: keyof InvoiceItem;
        value: string;
      }>
    ) => {
      const { invoiceIndex, itemIndex, field, value } = action.payload;
      const invoice = state.invoiceData?.[invoiceIndex];
      if (!invoice?.items?.[itemIndex]) return;

      invoice.items[itemIndex][field] = value;
    },

    removeItem: (
      state,
      action: PayloadAction<{ invoiceIndex: number; itemIndex: number }>
    ) => {
      const { invoiceIndex, itemIndex } = action.payload;
      const invoice = state.invoiceData?.[invoiceIndex];
      if (!invoice?.items) return;

      invoice.items = invoice.items.filter((_, i) => i !== itemIndex);
    },

    updateChargesAndTotals: (
      state,
      action: PayloadAction<{
        invoiceIndex: number;
        data: Partial<ChargesAndTotals>;
      }>
    ) => {
      const { invoiceIndex, data } = action.payload;
      const invoice = state.invoiceData?.[invoiceIndex];
      if (!invoice) return;

      invoice.chargesAndTotals = {
        ...invoice.chargesAndTotals,
        ...data,
      };
    },

    updateTaxDetails: (
      state,
      action: PayloadAction<{
        invoiceIndex: number;
        taxDetails: InvoiceTaxDetail[];
      }>
    ) => {
      const { invoiceIndex, taxDetails } = action.payload;
      const invoice = state.invoiceData?.[invoiceIndex];
      if (!invoice) return;

      invoice.chargesAndTotals = {
        ...invoice.chargesAndTotals,
        taxDetails,
      };
    },

    updateBankDetails: (
      state,
      action: PayloadAction<{
        invoiceIndex: number;
        data: Partial<BankDetails>;
      }>
    ) => {
      const { invoiceIndex, data } = action.payload;
      const invoice = state.invoiceData?.[invoiceIndex];
      if (!invoice) return;

      invoice.bankDetails = {
        ...invoice.bankDetails,
        ...data,
      };
    },

    updateNotes: (
      state,
      action: PayloadAction<{ invoiceIndex: number; notes: string }>
    ) => {
      const { invoiceIndex, notes } = action.payload;
      const invoice = state.invoiceData?.[invoiceIndex];
      if (!invoice) return;
      invoice.notes = notes;
    },

    updateTerms: (
      state,
      action: PayloadAction<{ invoiceIndex: number; terms: string }>
    ) => {
      const { invoiceIndex, terms } = action.payload;
      const invoice = state.invoiceData?.[invoiceIndex];
      if (!invoice) return;
      invoice.terms = terms;
    },
  },
});

export const {
  addInvoice,
  updateInvoiceInformation,
  addItem,
  updateItem,
  removeItem,
  updateChargesAndTotals,
  updateTaxDetails,
  updateBankDetails,
  updateNotes,
  updateTerms,
} = invoicesSlice.actions;

export default invoicesSlice.reducer;
