import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

function StudentDashboard() {
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentName, setStudentName] = useState('');

  // Add this useEffect to update the page title dynamically
  useEffect(() => {
    document.title = 'Student Dashboard - RLS-Guard-Dog';
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      } else {
        setStudentName(profileData.name);
      }
      
      const { data: progressData, error: progressError } = await supabase
        .from('progress')
        .select('assignment_name, score');

      if (progressError) {
        setError('Failed to fetch data.');
        console.error('Error fetching progress:', progressError);
      } else {
        setProgressData(progressData);
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };
  
  if (loading) {
    return <div className="p-3">Loading...</div>;
  }

  if (error) {
    return <div className="p-3 text-danger">{error}</div>;
  }

  return (
    <div className="container p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3">Welcome {studentName}, Your Progress</h1>
        <button
          onClick={handleLogout}
          className="btn btn-danger"
        >
          Logout
        </button>
      </div>
      
      <div className="table-responsive">
        <table className="table table-striped table-bordered">
          <thead>
            <tr>
              <th>Task Name</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {progressData.map((item) => (
              <tr key={item.id}>
                <td>{item.assignment_name}</td>
                <td>{item.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StudentDashboard;