import { describe, it, expect } from 'vitest'

// Mock the two-person rule helper logic
const canEnforceTwoPerson = (
  twoPersonRule: boolean,
  step1User: string | null,
  _step2User: string | null, // Unused parameter
  currentUser: string
): boolean => {
  if (!twoPersonRule) return true
  
  // If step1 not done, step2 can be done
  if (!step1User) return true
  
  // If step1 done by different user, step2 can be done
  if (step1User !== currentUser) return true
  
  // If step1 done by same user, step2 is disabled
  return false
}

describe('Two-Person Rule Helper', () => {
  it('should allow step2 when two-person rule is disabled', () => {
    const result = canEnforceTwoPerson(false, 'user1@test.com', null, 'user1@test.com')
    expect(result).toBe(true)
  })
  
  it('should allow step2 when step1 not done yet', () => {
    const result = canEnforceTwoPerson(true, null, null, 'user1@test.com')
    expect(result).toBe(true)
  })
  
  it('should allow step2 when step1 done by different user', () => {
    const result = canEnforceTwoPerson(true, 'user1@test.com', null, 'user2@test.com')
    expect(result).toBe(true)
  })
  
  it('should disable step2 when step1 done by same user', () => {
    const result = canEnforceTwoPerson(true, 'user1@test.com', null, 'user1@test.com')
    expect(result).toBe(false)
  })
  
  it('should allow step2 when step1 done by different user even if step2 already done', () => {
    const result = canEnforceTwoPerson(true, 'user1@test.com', 'user2@test.com', 'user3@test.com')
    expect(result).toBe(true)
  })
})
