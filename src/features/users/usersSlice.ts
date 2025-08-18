import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface User {
  email: string
  name?: string
  role: 'ops' | 'finance'
}

interface UsersState {
  users: User[]
  currentUser: User | null
}

const initialState: UsersState = {
  users: [
    {
      email: 'system@local',
      name: 'System User',
      role: 'ops'
    }
  ],
  currentUser: {
    email: 'system@local',
    name: 'System User',
    role: 'ops'
  }
}

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload
    },
    addUser: (state, action: PayloadAction<User>) => {
      // Don't add if user already exists
      const exists = state.users.some(user => user.email === action.payload.email)
      if (!exists) {
        state.users.push(action.payload)
      }
    },
    removeUser: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter(user => user.email !== action.payload)
      // If we're removing the current user, set to system user
      if (state.currentUser?.email === action.payload) {
        const systemUser = state.users.find(user => user.email === 'system@local')
        state.currentUser = systemUser || null
      }
    },
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload
    }
  }
})

export const { setCurrentUser, addUser, removeUser, setUsers } = usersSlice.actions
export default usersSlice.reducer
