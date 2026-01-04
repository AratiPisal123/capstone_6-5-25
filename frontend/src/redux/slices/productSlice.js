import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { fetchProducts as fetchProductsFromAPI } from '../../services/productService'

// Async thunk for fetching products
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchProductsFromAPI()
      return response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch products')
    }
  }
)

const initialState = {
  products: [],
  loading: false,
  error: null
}

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        state.products = action.payload
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { clearError } = productSlice.actions
export default productSlice.reducer