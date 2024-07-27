import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Api } from "../services/api";

interface IUser {
  token: IUser | null;
  id_postulante: any;
  id: number;
  name: string;
  email: string;
}

type AuthState = {
  token: string | null;
  user: IUser | null;
  isLogged: boolean;
  isLoading: boolean;
  role: string | null; 
};

const initialState: AuthState = {
  token: null,
  user: null,
  isLogged: false,
  isLoading: false,
  role: null,
};

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await Api.post('/auth/login', data);
      console.log('API Response:', response); // Imprime la respuesta para depuración

      if (response.statusCode === 200) {
        window.localStorage.setItem("token",response.data.token);
        return response.data; // Asegúrate de retornar 'response.data'
      }else if (response.statusCode === 403){
        return rejectWithValue('403');
      }
      else if (response.statusCode === 401){
        return rejectWithValue('401');
      }else{
        return rejectWithValue('Error desconocido');
      }
      
    } catch (error) {
      return rejectWithValue('Request failed');
    }
  }
);



export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
        state.token = null;
        state.user = null;
        state.isLogged = false;
        state.isLoading = false;
        state.role = null;
        window.localStorage.removeItem("token");
      }
 
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLogged = true;
        console.log('Fulfilled Action Payload:', action.payload); // Imprime el payload para depuración
        if (action.payload) {
          state.token = action.payload.token;
          state.user = action.payload.user;
          state.role = action.payload.user.role.name;
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isLogged = false;
        state.token = null;
        state.user = null;
        state.role = null;
        console.error(action.payload); // Imprime el error para depuración
      });
  },
});

// Exporta los actions y el reducer
export const { logout } = authSlice.actions;
export const { actions: authActions } = authSlice;
export default authSlice.reducer;
