import { useQuery } from '@tanstack/react-query';
import { getStudents, getStudent, getStudentEnrollments, getStudentPayments } from '@/services/students';
import type { QueryFilters } from '@/types/database';

export function useStudents(filters: QueryFilters = {}) {
  return useQuery({ queryKey: ['students', filters], queryFn: () => getStudents(filters) });
}

export function useStudent(id: string) {
  return useQuery({ queryKey: ['students', id], queryFn: () => getStudent(id), enabled: !!id });
}

export function useStudentEnrollments(studentId: string) {
  return useQuery({ queryKey: ['students', studentId, 'enrollments'], queryFn: () => getStudentEnrollments(studentId), enabled: !!studentId });
}

export function useStudentPayments(studentId: string) {
  return useQuery({ queryKey: ['students', studentId, 'payments'], queryFn: () => getStudentPayments(studentId), enabled: !!studentId });
}
