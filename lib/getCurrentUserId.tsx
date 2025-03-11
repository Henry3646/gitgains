import { supabase } from './supabase'

const getCurrentUserId = async (): Promise<string | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id || null
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export default getCurrentUserId