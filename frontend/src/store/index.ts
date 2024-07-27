import { combineReducers, configureStore, AnyAction } from "@reduxjs/toolkit";
import {thunk,ThunkDispatch} from "redux-thunk";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./authSlice"; // Asegúrate de que está importando el reducer
import { useDispatch } from "react-redux";

const persistConfig = {
  key: "root",
  storage,
};

const reducers = combineReducers({
  auth: authReducer, // Usa el reducer exportado por defecto
});

const persistedReducer = persistReducer(persistConfig, reducers);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }).concat(thunk),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export type AppThunkDispatch = ThunkDispatch<RootState,void,AnyAction>;
export const useAppDispatch = () =>useDispatch< AppThunkDispatch>();