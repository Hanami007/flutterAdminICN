import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pxwoxdbfjwfzxmmvrquh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4d294ZGJmandmenhtbXZycXVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NTUxODAsImV4cCI6MjA5NjAzMTE4MH0.IvFqdPF6maXm1FKu1SYW_ujY5_aBUACP2rXDGNc0Jzg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkPayments() {
  const { data, error } = await supabase.from('payments').select('*').limit(5);
  if (error) {
    console.error('Error fetching payments:', error);
  } else {
    console.log('Payments data keys:', data.length > 0 ? Object.keys(data[0]) : 'No records found');
    console.log('Payments records:', JSON.stringify(data, null, 2));
  }
}

checkPayments();
