import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../../app/store'

interface User {
  email: string
  role: 'ops' | 'finance'
}

const UsersView: React.FC = () => {
  const dispatch = useDispatch()
  const users = useSelector((state: RootState) => (state.users as any).users || []) as User[]
  const currentUser = useSelector((state: RootState) => (state.users as any).currentUser || 'system@local') as string
  
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserRole, setNewUserRole] = useState<'ops' | 'finance'>('ops')
  const [selectedCurrentUser, setSelectedCurrentUser] = useState(currentUser)
  
  const handleAddUser = () => {
    if (!newUserEmail.trim()) return
    
    const newUser: User = {
      email: newUserEmail.trim(),
      role: newUserRole
    }
    
    // Add to users array
    const updatedUsers = [...users, newUser]
    
    // Update Redux state (simplified - in real app would use proper action)
    dispatch({
      type: 'users/setUsers',
      payload: updatedUsers
    })
    
    setNewUserEmail('')
  }
  
  const handleSetCurrentUser = () => {
    dispatch({
      type: 'users/setCurrentUser',
      payload: selectedCurrentUser
    })
  }
  
  const handleRemoveUser = (email: string) => {
    const updatedUsers = users.filter((user: User) => user.email !== email)
    dispatch({
      type: 'users/setUsers',
      payload: updatedUsers
    })
  }
  
  return (
    <div data-testid="users-view" className="p-6">
      <h2 className="text-xl font-semibold mb-4">Users</h2>
      
      {/* Current User */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <h3 className="text-lg font-medium mb-4">Current User</h3>
        <div className="flex items-center space-x-4">
          <select
            value={selectedCurrentUser}
            onChange={(e) => setSelectedCurrentUser(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="system@local">system@local</option>
            {users.map((user: User) => (
              <option key={user.email} value={user.email}>
                {user.email} ({user.role})
              </option>
            ))}
          </select>
          <button
            onClick={handleSetCurrentUser}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Set Current User
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Current user: <strong>{currentUser}</strong>
        </p>
      </div>
      
      {/* Add User */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <h3 className="text-lg font-medium mb-4">Add User</h3>
        <div className="flex items-center space-x-4">
          <input
            type="email"
            placeholder="user@example.com"
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={newUserRole}
            onChange={(e) => setNewUserRole(e.target.value as 'ops' | 'finance')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ops">Operations</option>
            <option value="finance">Finance</option>
          </select>
          <button
            onClick={handleAddUser}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Add User
          </button>
        </div>
      </div>
      
      {/* Users List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-medium">Users ({users.length})</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {users.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500">
              No users added yet. Add users to enable the two-person rule.
            </div>
          ) : (
            users.map((user: User, index: number) => (
              <div key={index} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{user.email}</p>
                  <p className="text-sm text-gray-500 capitalize">{user.role}</p>
                </div>
                <button
                  onClick={() => handleRemoveUser(user.email)}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Two-Person Rule Info */}
      <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Two-Person Rule</h4>
        <p className="text-sm text-blue-700">
          When enabled in Settings, the two-person rule requires different users to acknowledge 
          Step 1 and Step 2 in the Orders checklist. This ensures proper oversight and reduces errors.
        </p>
      </div>
    </div>
  )
}

export default UsersView
