import { createClient } from '@supabase/supabase-js';
import { Contract, AnalysisResult } from '../types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function uploadContract(file: File, jurisdiction: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('contracts')
    .upload(fileName, file);
  
  if (error) throw error;
  
  const { data: contractData, error: dbError } = await supabase
    .from('contracts')
    .insert({
      filename: file.name,
      file_size: file.size,
      file_type: file.type,
      storage_path: data.path,
      jurisdiction,
      status: 'uploaded',
    })
    .select()
    .single();
  
  if (dbError) throw dbError;
  
  return contractData.id;
}

export async function getAnalysis(analysisId: string): Promise<AnalysisResult | null> {
  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('id', analysisId)
    .single();
  
  if (error) return null;
  
  return {
    id: data.id,
    contractId: data.contract_id,
    jurisdiction: data.jurisdiction,
    clauses: data.clauses,
    summary: data.summary,
    createdAt: data.created_at,
    status: data.status,
  };
}

export async function updateAnalysisEmail(analysisId: string, email: string): Promise<void> {
  const { error } = await supabase
    .from('analyses')
    .update({ user_email: email })
    .eq('id', analysisId);
  
  if (error) throw error;
}
