import { createClient } from '@supabase/supabase-js';
import 'cross-fetch/polyfill';

const SUPABASE_URL = 'https://eaibhnokyvpwemaqlhyx.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhaWJobm9reXZwd2VtYXFsaHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4Njc5MzcsImV4cCI6MjA3MzQ0MzkzN30.WgJ6Q33GlB5JsAWpx0GCNTVp45kiRRU8ffcLhIszCSc';

describe('Supabase RLS Integration Tests', () => {
  let teacherClient;
  let studentClient;
  let studentId;

  beforeAll(async () => {
    // Get the student's ID for testing
    const { data: studentProfiles } = await createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
      .from('profiles')
      .select('id')
      .eq('role', 'student');
      
    if (!studentProfiles || studentProfiles.length === 0) {
      throw new Error('No student profiles found for testing.');
    }
    
    studentId = studentProfiles[0].id;

    // Authenticate as the teacher
    const { data: teacherAuthData, error: teacherAuthError } = await createClient(SUPABASE_URL, SUPABASE_ANON_KEY).auth.signInWithPassword({
      email: 'vamsi@teacher.com',
      password: '072700', 
    });
    if (teacherAuthError) {
      throw new Error(`Teacher authentication failed: ${teacherAuthError.message}`);
    }
    teacherClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${teacherAuthData.session.access_token}` } },
    });

    // Authenticate as the student
    const { data: studentAuthData, error: studentAuthError } = await createClient(SUPABASE_URL, SUPABASE_ANON_KEY).auth.signInWithPassword({
      email: 'ram@student.com',
      password: '123456',
    });
    if (studentAuthError) {
      throw new Error(`Student authentication failed: ${studentAuthError.message}`);
    }
    studentClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${studentAuthData.session.access_token}` } },
    });
  });

  // Test Case 1: Student can only view their own progress
  test('Student can only view their own progress rows', async () => {
    const { data, error } = await studentClient.from('progress').select('*');
    expect(error).toBeNull();
    expect(data.length).toBe(1);
    expect(data[0].student_id).toBe(studentId);
  });

  // Test Case 2: Teacher can see all student progress
  test('Teacher can view all student progress rows', async () => {
    const { data, error } = await teacherClient.from('progress').select('*');
    expect(error).toBeNull();
    expect(data.length).toBe(4);
  });

  // Test Case 3: Teacher can update a student's score
  test('Teacher can update a student\'s score', async () => {
    const newScore = 99;
    const { error } = await teacherClient
      .from('progress')
      .update({ score: newScore })
      .eq('student_id', studentId);
    expect(error).toBeNull();

    const { data: updatedData } = await teacherClient.from('progress').select('*').eq('student_id', studentId);
    expect(updatedData[0].score).toBe(newScore);
  });
});