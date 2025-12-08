<?php

namespace App\Services;

use Carbon\Carbon;

class ZScoreService
{
    /**
     * Calculate Z-score for Weight-for-Age (WFA)
     * 
     * @param int $ageInDays Age in days
     * @param float $weight Weight in kg
     * @param string $gender 'L' for male, 'P' for female
     * @return float|null Z-score or null if out of range
     */
    public function calculateWFA(int $ageInDays, float $weight, string $gender): ?float
    {
        // Get WHO reference values for WFA
        $reference = $this->getWFAReference($ageInDays, $gender);
        
        if (!$reference) {
            return null;
        }

        return $this->calculateZScore($weight, $reference['median'], $reference['sd']);
    }

    /**
     * Calculate Z-score for Height-for-Age (HFA)
     * 
     * @param int $ageInDays Age in days
     * @param float $height Height in cm
     * @param string $gender 'L' for male, 'P' for female
     * @return float|null Z-score or null if out of range
     */
    public function calculateHFA(int $ageInDays, float $height, string $gender): ?float
    {
        // Get WHO reference values for HFA
        $reference = $this->getHFAReference($ageInDays, $gender);
        
        if (!$reference) {
            return null;
        }

        return $this->calculateZScore($height, $reference['median'], $reference['sd']);
    }

    /**
     * Calculate Z-score for Weight-for-Height (WFH)
     * 
     * @param float $height Height in cm
     * @param float $weight Weight in kg
     * @param string $gender 'L' for male, 'P' for female
     * @return float|null Z-score or null if out of range
     */
    public function calculateWFH(float $height, float $weight, string $gender): ?float
    {
        // Get WHO reference values for WFH
        $reference = $this->getWFHReference($height, $gender);
        
        if (!$reference) {
            return null;
        }

        return $this->calculateZScore($weight, $reference['median'], $reference['sd']);
    }

    /**
     * Calculate Z-score using formula: Z = (X - M) / SD
     */
    private function calculateZScore(float $observed, float $median, float $sd): float
    {
        if ($sd == 0) {
            return 0;
        }
        
        return round(($observed - $median) / $sd, 2);
    }

    /**
     * Get nutritional status based on Z-score
     * 
     * @param float|null $zScore Z-score value
     * @param string $type 'wfa', 'hfa', or 'wfh'
     * @return string Status: 'normal', 'pendek', 'sangat_pendek', 'stunting', 'wasted', 'severely_wasted'
     */
    public function getNutritionalStatus(?float $zScore, string $type): string
    {
        if ($zScore === null) {
            return 'tidak_diketahui';
        }

        switch ($type) {
            case 'hfa':
                // Height-for-Age: stunting classification
                if ($zScore < -3) {
                    return 'sangat_pendek';
                } elseif ($zScore < -2) {
                    return 'pendek';
                } else {
                    return 'normal';
                }

            case 'wfa':
                // Weight-for-Age: underweight classification
                if ($zScore < -3) {
                    return 'sangat_kurang';
                } elseif ($zScore < -2) {
                    return 'kurang';
                } elseif ($zScore <= 2) {
                    return 'normal';
                } else {
                    return 'lebih';
                }

            case 'wfh':
                // Weight-for-Height: wasting classification
                if ($zScore < -3) {
                    return 'sangat_kurus';
                } elseif ($zScore < -2) {
                    return 'kurus';
                } elseif ($zScore <= 2) {
                    return 'normal';
                } else {
                    return 'gemuk';
                }

            default:
                return 'tidak_diketahui';
        }
    }

    /**
     * Get overall nutritional status summary
     * Priority: stunting (HFA) > wasting (WFH) > underweight (WFA)
     */
    public function getOverallStatus(?float $zScoreHFA, ?float $zScoreWFH, ?float $zScoreWFA): string
    {
        $statusHFA = $this->getNutritionalStatus($zScoreHFA, 'hfa');
        $statusWFH = $this->getNutritionalStatus($zScoreWFH, 'wfh');
        $statusWFA = $this->getNutritionalStatus($zScoreWFA, 'wfa');

        // Priority: stunting first
        if ($statusHFA === 'sangat_pendek' || $statusHFA === 'pendek') {
            return $statusHFA === 'sangat_pendek' ? 'sangat_pendek' : 'pendek';
        }

        // Then wasting
        if ($statusWFH === 'sangat_kurus' || $statusWFH === 'kurus') {
            return $statusWFH;
        }

        // Then underweight
        if ($statusWFA === 'sangat_kurang' || $statusWFA === 'kurang') {
            return $statusWFA;
        }

        return 'normal';
    }

    /**
     * Get WHO reference values for Weight-for-Age
     * Note: This is a simplified version. In production, use full WHO reference tables.
     */
    private function getWFAReference(int $ageInDays, string $gender): ?array
    {
        $ageInMonths = $ageInDays / 30.44;
        
        // Simplified reference values (should be replaced with full WHO tables)
        // These are approximate values for demonstration
        if ($ageInMonths < 0 || $ageInMonths > 60) {
            return null;
        }

        // Example median and SD values (these should come from WHO reference tables)
        // For 0-24 months, use WHO Child Growth Standards
        // For 24-60 months, use WHO Growth Reference
        
        if ($gender === 'L') {
            // Male reference values (simplified)
            $median = 3.5 + ($ageInMonths * 0.5); // Approximate
            $sd = 0.8;
        } else {
            // Female reference values (simplified)
            $median = 3.3 + ($ageInMonths * 0.45); // Approximate
            $sd = 0.75;
        }

        return ['median' => $median, 'sd' => $sd];
    }

    /**
     * Get WHO reference values for Height-for-Age
     */
    private function getHFAReference(int $ageInDays, string $gender): ?array
    {
        $ageInMonths = $ageInDays / 30.44;
        
        if ($ageInMonths < 0 || $ageInMonths > 60) {
            return null;
        }

        // Simplified reference values
        if ($gender === 'L') {
            $median = 50 + ($ageInMonths * 1.5); // Approximate
            $sd = 2.5;
        } else {
            $median = 49 + ($ageInMonths * 1.4); // Approximate
            $sd = 2.3;
        }

        return ['median' => $median, 'sd' => $sd];
    }

    /**
     * Get WHO reference values for Weight-for-Height
     */
    private function getWFHReference(float $height, string $gender): ?array
    {
        // Height should be between 45-120 cm for WHO reference
        if ($height < 45 || $height > 120) {
            return null;
        }

        // Simplified reference values
        if ($gender === 'L') {
            $median = ($height - 50) * 0.15 + 3.5; // Approximate
            $sd = 0.6;
        } else {
            $median = ($height - 49) * 0.14 + 3.3; // Approximate
            $sd = 0.55;
        }

        return ['median' => $median, 'sd' => $sd];
    }

    /**
     * Calculate age in days from birth date
     */
    public function calculateAgeInDays(Carbon $birthDate, ?Carbon $measurementDate = null): int
    {
        $measurementDate = $measurementDate ?? Carbon::now();
        return $birthDate->diffInDays($measurementDate);
    }
}

