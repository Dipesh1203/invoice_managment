import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ProductItem {
  id: string;
  name: string;
  quantity: string; // kept as string to match other slices which store numbers as strings
  unitPrice: string;
  tax: string;
  discount?: string;
  [key: string]: string | undefined;
}

interface ProductState {
  productData?: ProductItem[];
}

const initialState: ProductState = {
  productData: [],
};

const computePriceWithTax = (p: ProductItem): string => {
  const q = Number(p.quantity || 0);
  const up = Number(p.unitPrice || 0);
  const taxPerc = Number(p.tax || 0);
  const discount = Number(p.discount || 0);

  const base = q * up;
  const taxed = base * (1 + taxPerc / 100);
  const finalAmount = taxed - discount;

  const safe = Number.isFinite(finalAmount) ? finalAmount : 0;
  return safe.toFixed(2);
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    addProduct: (state, action: PayloadAction<Omit<ProductItem, "id">>) => {
      const newProduct: ProductItem = {
        id: Date.now().toString(),
        ...action.payload,
      } as ProductItem;
      state.productData = [...(state.productData || []), newProduct];
    },
    updateProduct: (
      state,
      action: PayloadAction<{ id: string; field: string; value: string }>
    ) => {
      const { id, field, value } = action.payload;
      const idx = state.productData?.findIndex((p) => p.id === id) ?? -1;
      if (idx !== -1 && state.productData) {
        state.productData[idx] = { ...state.productData[idx], [field]: value };
      }
    },
    removeProduct: (state, action: PayloadAction<{ id: string }>) => {
      state.productData = (state.productData || []).filter(
        (p) => p.id !== action.payload.id
      );
    },
    setProducts: (state, action: PayloadAction<ProductItem[]>) => {
      state.productData = action.payload;
    },
  },
});

export const selectProducts = (rootState: any): ProductItem[] =>
  rootState?.products?.productData || [];

export const selectProductTableRows = (rootState: any) =>
  selectProducts(rootState).map((p) => ({
    id: p.id,
    name: p.name || "",
    quantity: p.quantity || "0",
    unitPrice: p.unitPrice || "0",
    tax: p.tax || "0",
    discount: p.discount || undefined,
    priceWithTax: computePriceWithTax(p),
  }));

export const { addProduct, updateProduct, removeProduct, setProducts } =
  productSlice.actions;

export default productSlice.reducer;
