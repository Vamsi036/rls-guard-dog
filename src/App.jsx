import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Login from './Login';
import StudentDashboard from './StudentDashboard';
import TeacherDashboard from './TeacherDashboard';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

function App() {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessionAndRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      if (session) {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching role:', error);
          setRole(null);
        } else {
          setRole(data.role);
        }
      }
      setLoading(false);
    };

    fetchSessionAndRole();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (session) {
          // When a new session is available, fetch the role again
          fetchSessionAndRole();
        } else {
          setRole(null); // Clear the role on sign out
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div className="d-flex align-items-center justify-content-center vh-100">Loading...</div>;
  }

  if (!session) {
    return <Login />;
  }
  
  if (role === null) {
      return <div className="d-flex align-items-center justify-content-center vh-100">Determining user role...</div>;
  }

  if (role === 'teacher') {
    return <TeacherDashboard />;
  }

  if (role === 'student') {
    return <StudentDashboard />;
  }

  return <div className="d-flex align-items-center justify-content-center vh-100">An error occurred.</div>;
}

export default App;