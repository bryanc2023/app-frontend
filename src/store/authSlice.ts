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
      

      if (response.statusCode === 200) {
        window.localStorage.setItem("token",response.data.token);
        // Si no hay role asignado, asegúrate de establecerlo como "Sin rol asignado"
      // Asegúrate de que el rol existe, si no asigna un valor predeterminado
      if (!response.data.user.role) {
        response.data.user.role = { name: "Sin rol asignado" }; // Corrige la asignación del rol
      }

      
        return response.data;
         // Asegúrate de retornar 'response.data'
      }else if (response.statusCode === 403){
        return rejectWithValue('403');
      }
      else if (response.statusCode === 401){
        return rejectWithValue('401');
      }else{
        return rejectWithValue('300');
      }
      
    } catch (error) {
      // Muestra el error en la consola para mayor información
      console.error("Error en la solicitud:", error);
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
        window.localStorage.removeItem('role');
        localStorage.clear();
        sessionStorage.clear();

        // Opción adicional para borrar caches del navegador si es necesario:
        if ('caches' in window) {
            caches.keys().then((names) => {
                names.forEach((name) => {
                    caches.delete(name);
                });
            });
        }
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
