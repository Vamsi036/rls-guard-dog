import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

function TeacherDashboard() {
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingScore, setEditingScore] = useState('');
  const [teacherName, setTeacherName] = useState('');

  // Add this useEffect to update the page title dynamically
  useEffect(() => {
    document.title = 'Teacher Dashboard - RLS-Guard-Dog';
  }, []);

  const fetchProgress = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const teacherId = session?.user?.id;

    const { data, error } = await supabase
      .from('progress')
      .select('*, profiles(name)')
      .neq('student_id', teacherId);

    if (error) {
      setError('Failed to fetch data.');
      console.error('Error fetching progress:', error);
    } else {
      setProgressData(data);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      } else {
        setTeacherName(profileData.name);
      }

      fetchProgress();
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleEditClick = (id, score) => {
    setEditingId(id);
    setEditingScore(score);
  };

  const handleCancelClick = () => {
    setEditingId(null);
    setEditingScore('');
  };

  const handleSaveClick = async (id) => {
    const { error } = await supabase
      .from('progress')
      .update({ score: editingScore })
      .eq('id', id);

    if (error) {
      alert('Error updating score. Check console for details.');
      console.error('Error updating score:', error);
    } else {
      setEditingId(null);
      setEditingScore('');
      fetchProgress();
    }
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
        <h1 className="h3">Welcome {teacherName}, Student Progress Overview</h1>
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
              <th>Student Name</th>
              <th>Assignment</th>
              <th>Score</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {progressData.map((item) => (
              <tr key={item.id}>
                <td>{item.profiles?.name || 'N/A'}</td>
                <td>{item.assignment_name}</td>
                <td>
                  {editingId === item.id ? (
                    <input
                      type="number"
                      value={editingScore}
                      onChange={(e) => setEditingScore(e.target.value)}
                      className="form-control"
                    />
                  ) : (
                    item.score
                  )}
                </td>
                <td>
                  {editingId === item.id ? (
                    <>
                      <button
                        onClick={() => handleSaveClick(item.id)}
                        className="btn btn-success btn-sm me-2"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelClick}
                        className="btn btn-secondary btn-sm"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleEditClick(item.id, item.score)}
                      className="btn btn-primary btn-sm"
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TeacherDashboard;