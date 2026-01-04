import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { subscriptionService } from '../../services/subscriptionService'

// Async thunks
export const fetchSubscriptions = createAsyncThunk(
  'subscriptions/fetchSubscriptions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await subscriptionService.getSubscriptions()
      return response
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error)
      return rejectWithValue('Failed to load subscriptions')
    }
  }
)

export const createSubscription = createAsyncThunk(
  'subscriptions/createSubscription',
  async (subscriptionData, { rejectWithValue }) => {
    try {
      const response = await subscriptionService.createSubscription(subscriptionData)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateSubscription = createAsyncThunk(
  'subscriptions/updateSubscription',
  async ({ subscriptionId, updateData }, { rejectWithValue }) => {
    try {
      const response = await subscriptionService.updateSubscription(subscriptionId, updateData)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const pauseSubscription = createAsyncThunk(
  'subscriptions/pauseSubscription',
  async (subscriptionId, { rejectWithValue }) => {
    try {
      const response = await subscriptionService.pauseSubscription(subscriptionId)
      return { subscriptionId, response }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const resumeSubscription = createAsyncThunk(
  'subscriptions/resumeSubscription',
  async (subscriptionId, { rejectWithValue }) => {
    try {
      const response = await subscriptionService.resumeSubscription(subscriptionId)
      return { subscriptionId, response }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const skipNextDelivery = createAsyncThunk(
  'subscriptions/skipNextDelivery',
  async (subscriptionId, { rejectWithValue }) => {
    try {
      const response = await subscriptionService.skipNextDelivery(subscriptionId)
      return { subscriptionId, response }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const cancelSubscription = createAsyncThunk(
  'subscriptions/cancelSubscription',
  async (subscriptionId, { rejectWithValue }) => {
    try {
      const response = await subscriptionService.cancelSubscription(subscriptionId)
      return { subscriptionId, response }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchSubscriptionCategories = createAsyncThunk(
  'subscriptions/fetchSubscriptionCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await subscriptionService.getSubscriptionCategories()
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const initialState = {
  subscriptions: [],
  categories: [],
  loading: false,
  error: null,
  selectedCategory: null,
  creatingSubscription: false,
  updatingSubscription: false
}

const subscriptionSlice = createSlice({
  name: 'subscriptions',
  initialState,
  reducers: {
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    resetSubscriptionState: (state) => {
      state.subscriptions = []
      state.categories = []
      state.loading = false
      state.error = null
      state.selectedCategory = null
      state.creatingSubscription = false
      state.updatingSubscription = false
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch subscriptions
      .addCase(fetchSubscriptions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => {
        state.loading = false
        state.subscriptions = action.payload || []
      })
      .addCase(fetchSubscriptions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Create subscription
      .addCase(createSubscription.pending, (state) => {
        state.creatingSubscription = true
        state.error = null
      })
      .addCase(createSubscription.fulfilled, (state, action) => {
        state.creatingSubscription = false
        state.subscriptions.push(action.payload)
      })
      .addCase(createSubscription.rejected, (state, action) => {
        state.creatingSubscription = false
        state.error = action.payload
      })
      
      // Update subscription
      .addCase(updateSubscription.pending, (state) => {
        state.updatingSubscription = true
        state.error = null
      })
      .addCase(updateSubscription.fulfilled, (state, action) => {
        state.updatingSubscription = false
        const index = state.subscriptions.findIndex(sub => sub.id === action.payload.id)
        if (index !== -1) {
          state.subscriptions[index] = action.payload
        }
      })
      .addCase(updateSubscription.rejected, (state, action) => {
        state.updatingSubscription = false
        state.error = action.payload
      })
      
      // Pause subscription
      .addCase(pauseSubscription.fulfilled, (state, action) => {
        const { subscriptionId } = action.payload
        const index = state.subscriptions.findIndex(sub => sub.id === subscriptionId)
        if (index !== -1) {
          state.subscriptions[index].status = 'paused'
        }
      })
      .addCase(pauseSubscription.rejected, (state, action) => {
        state.error = action.payload
      })
      
      // Resume subscription
      .addCase(resumeSubscription.fulfilled, (state, action) => {
        const { subscriptionId } = action.payload
        const index = state.subscriptions.findIndex(sub => sub.id === subscriptionId)
        if (index !== -1) {
          state.subscriptions[index].status = 'active'
        }
      })
      .addCase(resumeSubscription.rejected, (state, action) => {
        state.error = action.payload
      })
      
      // Skip next delivery
      .addCase(skipNextDelivery.fulfilled, (state, action) => {
        const { subscriptionId } = action.payload
        const index = state.subscriptions.findIndex(sub => sub.id === subscriptionId)
        if (index !== -1) {
          // Update next delivery date based on response
          if (action.payload.nextDeliveryDate) {
            state.subscriptions[index].nextDeliveryDate = action.payload.nextDeliveryDate
          }
        }
      })
      .addCase(skipNextDelivery.rejected, (state, action) => {
        state.error = action.payload
      })
      
      // Cancel subscription
      .addCase(cancelSubscription.fulfilled, (state, action) => {
        const { subscriptionId } = action.payload
        const index = state.subscriptions.findIndex(sub => sub.id === subscriptionId)
        if (index !== -1) {
          state.subscriptions[index].status = 'cancelled'
        }
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.error = action.payload
      })
      
      // Fetch categories
      .addCase(fetchSubscriptionCategories.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSubscriptionCategories.fulfilled, (state, action) => {
        state.loading = false
        state.categories = action.payload || []
      })
      .addCase(fetchSubscriptionCategories.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { setSelectedCategory, clearError, resetSubscriptionState } = subscriptionSlice.actions

export default subscriptionSlice.reducer