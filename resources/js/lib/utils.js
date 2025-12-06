import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Get color class for nutritional status badge
 */
export function getStatusColor(status) {
  const statusColors = {
    'normal': 'bg-green-100 text-green-800 border-green-200',
    'tidak_diketahui': 'bg-gray-100 text-gray-800 border-gray-200',
    'pendek': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'kurang': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'kurus': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'sangat_pendek': 'bg-red-100 text-red-800 border-red-200',
    'sangat_kurang': 'bg-red-100 text-red-800 border-red-200',
    'sangat_kurus': 'bg-red-100 text-red-800 border-red-200',
    'lebih': 'bg-blue-100 text-blue-800 border-blue-200',
    'gemuk': 'bg-blue-100 text-blue-800 border-blue-200',
  };

  return statusColors[status] || statusColors['tidak_diketahui'];
}

/**
 * Get Indonesian label for nutritional status
 */
export function getStatusLabel(status) {
  const statusLabels = {
    'normal': 'Normal',
    'tidak_diketahui': 'Belum Diketahui',
    'pendek': 'Pendek',
    'sangat_pendek': 'Sangat Pendek',
    'kurang': 'Kurang',
    'sangat_kurang': 'Sangat Kurang',
    'kurus': 'Kurus',
    'sangat_kurus': 'Sangat Kurus',
    'lebih': 'Lebih',
    'gemuk': 'Gemuk',
  };

  return statusLabels[status] || 'Belum Diketahui';
}

/**
 * Calculate age in months from birth date (real-time)
 */
export function calculateAgeInMonths(birthDate) {
  if (!birthDate) return 0;
  
  const birth = new Date(birthDate);
  const now = new Date();
  
  const years = now.getFullYear() - birth.getFullYear();
  const months = now.getMonth() - birth.getMonth();
  const days = now.getDate() - birth.getDate();
  
  let totalMonths = years * 12 + months;
  
  // Adjust if the current day hasn't reached the birth day yet
  if (days < 0) {
    totalMonths--;
  }
  
  return Math.max(0, totalMonths);
}

/**
 * Format age in months to readable string
 */
export function formatAge(ageInMonths) {
  if (!ageInMonths || ageInMonths < 1) {
    return 'Kurang dari 1 bulan';
  } else if (ageInMonths < 12) {
    return `${Math.floor(ageInMonths)} bulan`;
  } else {
    const years = Math.floor(ageInMonths / 12);
    const months = Math.floor(ageInMonths % 12);
    if (months === 0) {
      return `${years} tahun`;
    } else {
      return `${years} tahun ${months} bulan`;
    }
  }
}

/**
 * Format age from birth date directly (real-time calculation)
 */
export function formatAgeFromBirthDate(birthDate) {
  const ageInMonths = calculateAgeInMonths(birthDate);
  return formatAge(ageInMonths);
}
