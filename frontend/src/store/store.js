import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../redux/slices/authSlice'
import subscriptionReducer from '../redux/slices/subscriptionSlice'
import productReducer from '../redux/slices/productSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    subscriptions: subscriptionReducer,
    products: productReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export default store
