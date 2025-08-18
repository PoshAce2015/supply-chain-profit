export type AppUser = { email: string; role?: string; name?: string }

// We've seen both shapes used in the project/tests:
const FLAT = "users.currentUser"               // stringified user
const BLOB = "scp:v1"                           // { users: { currentUser: user } }

/** Read the current user from either storage layout */
export function readUser(): AppUser | null {
  try {
    const flat = localStorage.getItem(FLAT)
    if (flat) {
      const parsed = JSON.parse(flat)
      if (parsed && typeof parsed === 'object' && parsed.email) {
        return parsed
      }
    }
  } catch (error) {
    console.warn('Error reading flat user storage:', error)
  }
  
  try {
    const blob = localStorage.getItem(BLOB)
    if (blob) {
      const parsed = JSON.parse(blob)
      const user = parsed?.users?.currentUser
      if (user && typeof user === 'object' && user.email) {
        return user
      }
    }
  } catch (error) {
    console.warn('Error reading blob user storage:', error)
  }
  
  return null
}

/** Persist to both layouts so guards & tests stay in sync */
export function writeUser(u: AppUser) {
  if (!u || !u.email) {
    console.warn('Attempted to write invalid user:', u)
    return
  }
  
  try {
    localStorage.setItem(FLAT, JSON.stringify(u))
  } catch (error) {
    console.error('Error writing flat user storage:', error)
  }
  
  try {
    localStorage.setItem(BLOB, JSON.stringify({ users: { currentUser: u } }))
  } catch (error) {
    console.error('Error writing blob user storage:', error)
  }
}

/** Remove *both* layouts so RedirectIfAuthed can't bounce us back */
export function clearUser() {
  try {
    localStorage.removeItem(FLAT)
  } catch (error) {
    console.warn('Error clearing flat user storage:', error)
  }
  
  try {
    const blob = localStorage.getItem(BLOB)
    if (blob) {
      // If some code expects BLOB to exist, null out the nested field; otherwise remove it.
      try {
        const parsed = JSON.parse(blob)
        if (parsed?.users) {
          parsed.users.currentUser = null
          localStorage.setItem(BLOB, JSON.stringify(parsed))
        } else {
          localStorage.removeItem(BLOB)
        }
      } catch {
        localStorage.removeItem(BLOB)
      }
    }
  } catch (error) {
    console.warn('Error clearing blob user storage:', error)
  }
  
  // Clear any additional auth-related storage
  try {
    localStorage.removeItem("demo:users")
    localStorage.removeItem("users")
    localStorage.removeItem("currentUser")
    sessionStorage.clear()
  } catch (error) {
    console.warn('Error clearing additional storage:', error)
  }
}

/** Truthy when any storage layout has a user */
export function isAuthed(): boolean {
  const user = readUser()
  return !!(user && user.email)
}

/** Get user role for authorization checks */
export function getUserRole(): string | null {
  const user = readUser()
  return user?.role || null
}

/** Check if user has specific role */
export function hasRole(role: string): boolean {
  const userRole = getUserRole()
  return userRole === role
}

/** Validate user data structure */
export function validateUser(user: any): user is AppUser {
  return (
    user &&
    typeof user === 'object' &&
    typeof user.email === 'string' &&
    user.email.length > 0 &&
    user.email.includes('@')
  )
}

/** Safe user storage with validation */
export function safeWriteUser(user: any): boolean {
  if (!validateUser(user)) {
    console.error('Invalid user data:', user)
    return false
  }
  
  try {
    writeUser(user)
    return true
  } catch (error) {
    console.error('Error writing user:', error)
    return false
  }
}

/** Get user display name */
export function getUserDisplayName(): string {
  const user = readUser()
  if (!user) return 'Unknown User'
  
  if (user.name) return user.name
  if (user.email) return user.email.split('@')[0]
  
  return 'Unknown User'
}

/** Check if user session is still valid (basic check) */
export function isSessionValid(): boolean {
  const user = readUser()
  if (!user) return false
  
  // Basic validation - in a real app, you'd check token expiration
  return !!(user.email && user.email.includes('@'))
}
