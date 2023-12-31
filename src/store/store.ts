import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { reducer as userAuthReducer } from "./userAuth/userAuth.slice";
import { reducer as userDataReducer } from "./userData/userData.slice";

const reducers = combineReducers({
    userAuth: userAuthReducer,
    userData: userDataReducer,
})

export const store = configureStore({
    reducer: reducers,
})

export type RootState = ReturnType<typeof reducers>;
export type AppDispatch = typeof store.dispatch;