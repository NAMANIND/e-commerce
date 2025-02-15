import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Session, User } from "@supabase/supabase-js";

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
}

const initialState: AuthState = {
  session: null,
  user: null,
  loading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<Session | null>) => {
      state.session = action.payload;
      state.user = action.payload?.user || null;
      state.loading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    clearSession: (state) => {
      state.session = null;
      state.user = null;
      state.loading = false;
    },
  },
});

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectSession = (state: { auth: AuthState }) => state.auth.session;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  !!state.auth.session;
export const selectAuthLoading = (state: { auth: AuthState }) =>
  state.auth.loading;

export const { setSession, setLoading, clearSession } = authSlice.actions;

export default authSlice.reducer;
