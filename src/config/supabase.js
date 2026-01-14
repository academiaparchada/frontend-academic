// src/config/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://syqkydikilbqojbynxvy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5cWt5ZGlraWxicW9qYnlueHZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNDk5MDcsImV4cCI6MjA4MTkyNTkwN30.dUaGMYYBM-S5elwLO-2cwAgUzIXHKi1nOQwjfi2Rsp4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
