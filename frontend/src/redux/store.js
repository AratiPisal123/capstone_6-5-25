import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import subscriptionReducer from './slices/subscriptionSlice'
import productReducer from './slices/productSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    subscriptions: subscriptionReducer,
    products: productReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
      }
    })
})
