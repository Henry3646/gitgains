import { supabase } from '../lib/supabase.js';

const getCurrentUserId = async () => {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Error fetching session:', error);
      return null;
    }

    const session = data?.session;
    if (session?.user) {
       // Set the userId after getting the session
      // return session.user.id;
      return 'e9cac5f4-62df-46bd-afc4-08d89aba2f51'      
    }
    return null;
  };

  export default getCurrentUserId