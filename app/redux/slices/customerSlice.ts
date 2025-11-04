import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CustomerItem {
  id: string;
  name: string;
  phone?: string;
  purchases?: string[];
  [key: string]: string | string[] | undefined;
}

interface CustomerState {
  customerData?: CustomerItem[];
}

const initialState: CustomerState = {
  customerData: [],
};

const computeTotalPurchase = (purchases?: string[]): string => {
  if (!purchases || purchases.length === 0) return "0.00";
  const sum = purchases
    .map((s) => Number(s || 0))
    .reduce((acc, v) => acc + (Number.isFinite(v) ? v : 0), 0);
  return sum.toFixed(2);
};

const customersSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    addCustomer: (state, action: PayloadAction<Omit<CustomerItem, "id">>) => {
      const newCustomer: CustomerItem = {
        id: Date.now().toString(),
        ...action.payload,
      } as CustomerItem;
      state.customerData = [...(state.customerData || []), newCustomer];
    },
    updateCustomer: (
      state,
      action: PayloadAction<{ id: string; field: string; value: string }>
    ) => {
      const { id, field, value } = action.payload;
      const idx = state.customerData?.findIndex((c) => c.id === id) ?? -1;
      if (idx !== -1 && state.customerData) {
        state.customerData[idx] = {
          ...state.customerData[idx],
          [field]: value,
        };
      }
    },
    removeCustomer: (state, action: PayloadAction<{ id: string }>) => {
      state.customerData = (state.customerData || []).filter(
        (c) => c.id !== action.payload.id
      );
    },
    addPurchase: (
      state,
      action: PayloadAction<{ id: string; amount: string }>
    ) => {
      const { id, amount } = action.payload;
      const idx = state.customerData?.findIndex((c) => c.id === id) ?? -1;
      if (idx !== -1 && state.customerData) {
        const customer = state.customerData[idx];
        const purchases = customer.purchases
          ? [...customer.purchases, amount]
          : [amount];
        state.customerData[idx] = { ...customer, purchases };
      }
    },
    setCustomers: (state, action: PayloadAction<CustomerItem[]>) => {
      state.customerData = action.payload;
    },
  },
});

export const selectCustomers = (rootState: any): CustomerItem[] =>
  rootState?.customers?.customerData || [];

export const selectCustomerTableRows = (rootState: any) =>
  selectCustomers(rootState).map((c) => ({
    id: c.id,
    customerName: c.name || "",
    phoneNumber: (c.phone as string) || "",
    totalPurchaseAmount: computeTotalPurchase(c.purchases),
    purchases: c.purchases || [],
  }));

export const {
  addCustomer,
  updateCustomer,
  removeCustomer,
  addPurchase,
  setCustomers,
} = customersSlice.actions;

export default customersSlice.reducer;
