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
     * Get WHO reference values for Weight-for-Age (WHO 2006 Standards)
     * Based on official WHO Child Growth Standards 2006
     * Age range: 0-60 months
     */
    private function getWFAReference(int $ageInDays, string $gender): ?array
    {
        $ageInMonths = round($ageInDays / 30.44);
        
        if ($ageInMonths < 0 || $ageInMonths > 60) {
            return null;
        }

        // WHO 2006 Weight-for-Age Standards (L, M, S parameters)
        // Using LMS method: Z = ((value/M)^L - 1) / (L*S)
        // For simplicity, we'll use M (median) and SD approximation
        
        $references = $this->getWFATable($gender);
        
        if (!isset($references[$ageInMonths])) {
            return null;
        }

        return $references[$ageInMonths];
    }

    /**
     * WHO Weight-for-Age reference table
     */
    private function getWFATable(string $gender): array
    {
        if ($gender === 'L') {
            // Male Weight-for-Age (kg) - Median and SD
            return [
                0 => ['median' => 3.3, 'sd' => 0.4],
                1 => ['median' => 4.5, 'sd' => 0.5],
                2 => ['median' => 5.6, 'sd' => 0.6],
                3 => ['median' => 6.4, 'sd' => 0.7],
                4 => ['median' => 7.0, 'sd' => 0.7],
                5 => ['median' => 7.5, 'sd' => 0.8],
                6 => ['median' => 7.9, 'sd' => 0.8],
                7 => ['median' => 8.3, 'sd' => 0.8],
                8 => ['median' => 8.6, 'sd' => 0.8],
                9 => ['median' => 8.9, 'sd' => 0.9],
                10 => ['median' => 9.2, 'sd' => 0.9],
                11 => ['median' => 9.4, 'sd' => 0.9],
                12 => ['median' => 9.6, 'sd' => 0.9],
                13 => ['median' => 9.9, 'sd' => 0.9],
                14 => ['median' => 10.1, 'sd' => 1.0],
                15 => ['median' => 10.3, 'sd' => 1.0],
                16 => ['median' => 10.5, 'sd' => 1.0],
                17 => ['median' => 10.7, 'sd' => 1.0],
                18 => ['median' => 10.9, 'sd' => 1.0],
                19 => ['median' => 11.1, 'sd' => 1.0],
                20 => ['median' => 11.3, 'sd' => 1.1],
                21 => ['median' => 11.5, 'sd' => 1.1],
                22 => ['median' => 11.8, 'sd' => 1.1],
                23 => ['median' => 12.0, 'sd' => 1.1],
                24 => ['median' => 12.2, 'sd' => 1.1],
                25 => ['median' => 12.4, 'sd' => 1.1],
                26 => ['median' => 12.5, 'sd' => 1.2],
                27 => ['median' => 12.7, 'sd' => 1.2],
                28 => ['median' => 12.9, 'sd' => 1.2],
                29 => ['median' => 13.1, 'sd' => 1.2],
                30 => ['median' => 13.3, 'sd' => 1.2],
                31 => ['median' => 13.5, 'sd' => 1.3],
                32 => ['median' => 13.7, 'sd' => 1.3],
                33 => ['median' => 13.8, 'sd' => 1.3],
                34 => ['median' => 14.0, 'sd' => 1.3],
                35 => ['median' => 14.2, 'sd' => 1.3],
                36 => ['median' => 14.3, 'sd' => 1.4],
                37 => ['median' => 14.5, 'sd' => 1.4],
                38 => ['median' => 14.7, 'sd' => 1.4],
                39 => ['median' => 14.8, 'sd' => 1.4],
                40 => ['median' => 15.0, 'sd' => 1.4],
                41 => ['median' => 15.2, 'sd' => 1.5],
                42 => ['median' => 15.3, 'sd' => 1.5],
                43 => ['median' => 15.5, 'sd' => 1.5],
                44 => ['median' => 15.7, 'sd' => 1.5],
                45 => ['median' => 15.8, 'sd' => 1.5],
                46 => ['median' => 16.0, 'sd' => 1.6],
                47 => ['median' => 16.2, 'sd' => 1.6],
                48 => ['median' => 16.3, 'sd' => 1.6],
                49 => ['median' => 16.5, 'sd' => 1.6],
                50 => ['median' => 16.7, 'sd' => 1.7],
                51 => ['median' => 16.8, 'sd' => 1.7],
                52 => ['median' => 17.0, 'sd' => 1.7],
                53 => ['median' => 17.2, 'sd' => 1.7],
                54 => ['median' => 17.3, 'sd' => 1.8],
                55 => ['median' => 17.5, 'sd' => 1.8],
                56 => ['median' => 17.7, 'sd' => 1.8],
                57 => ['median' => 17.8, 'sd' => 1.8],
                58 => ['median' => 18.0, 'sd' => 1.9],
                59 => ['median' => 18.2, 'sd' => 1.9],
                60 => ['median' => 18.3, 'sd' => 1.9],
            ];
        } else {
            // Female Weight-for-Age (kg) - Median and SD
            return [
                0 => ['median' => 3.2, 'sd' => 0.4],
                1 => ['median' => 4.2, 'sd' => 0.5],
                2 => ['median' => 5.1, 'sd' => 0.6],
                3 => ['median' => 5.8, 'sd' => 0.7],
                4 => ['median' => 6.4, 'sd' => 0.7],
                5 => ['median' => 6.9, 'sd' => 0.7],
                6 => ['median' => 7.3, 'sd' => 0.8],
                7 => ['median' => 7.6, 'sd' => 0.8],
                8 => ['median' => 7.9, 'sd' => 0.8],
                9 => ['median' => 8.2, 'sd' => 0.8],
                10 => ['median' => 8.5, 'sd' => 0.9],
                11 => ['median' => 8.7, 'sd' => 0.9],
                12 => ['median' => 8.9, 'sd' => 0.9],
                13 => ['median' => 9.2, 'sd' => 0.9],
                14 => ['median' => 9.4, 'sd' => 0.9],
                15 => ['median' => 9.6, 'sd' => 1.0],
                16 => ['median' => 9.8, 'sd' => 1.0],
                17 => ['median' => 10.0, 'sd' => 1.0],
                18 => ['median' => 10.2, 'sd' => 1.0],
                19 => ['median' => 10.4, 'sd' => 1.0],
                20 => ['median' => 10.6, 'sd' => 1.1],
                21 => ['median' => 10.9, 'sd' => 1.1],
                22 => ['median' => 11.1, 'sd' => 1.1],
                23 => ['median' => 11.3, 'sd' => 1.1],
                24 => ['median' => 11.5, 'sd' => 1.1],
                25 => ['median' => 11.7, 'sd' => 1.1],
                26 => ['median' => 11.9, 'sd' => 1.2],
                27 => ['median' => 12.1, 'sd' => 1.2],
                28 => ['median' => 12.3, 'sd' => 1.2],
                29 => ['median' => 12.5, 'sd' => 1.2],
                30 => ['median' => 12.7, 'sd' => 1.3],
                31 => ['median' => 12.9, 'sd' => 1.3],
                32 => ['median' => 13.1, 'sd' => 1.3],
                33 => ['median' => 13.3, 'sd' => 1.3],
                34 => ['median' => 13.5, 'sd' => 1.3],
                35 => ['median' => 13.7, 'sd' => 1.4],
                36 => ['median' => 13.9, 'sd' => 1.4],
                37 => ['median' => 14.0, 'sd' => 1.4],
                38 => ['median' => 14.2, 'sd' => 1.4],
                39 => ['median' => 14.4, 'sd' => 1.4],
                40 => ['median' => 14.6, 'sd' => 1.5],
                41 => ['median' => 14.8, 'sd' => 1.5],
                42 => ['median' => 15.0, 'sd' => 1.5],
                43 => ['median' => 15.2, 'sd' => 1.5],
                44 => ['median' => 15.3, 'sd' => 1.6],
                45 => ['median' => 15.5, 'sd' => 1.6],
                46 => ['median' => 15.7, 'sd' => 1.6],
                47 => ['median' => 15.9, 'sd' => 1.6],
                48 => ['median' => 16.1, 'sd' => 1.7],
                49 => ['median' => 16.3, 'sd' => 1.7],
                50 => ['median' => 16.4, 'sd' => 1.7],
                51 => ['median' => 16.6, 'sd' => 1.7],
                52 => ['median' => 16.8, 'sd' => 1.8],
                53 => ['median' => 17.0, 'sd' => 1.8],
                54 => ['median' => 17.2, 'sd' => 1.8],
                55 => ['median' => 17.3, 'sd' => 1.9],
                56 => ['median' => 17.5, 'sd' => 1.9],
                57 => ['median' => 17.7, 'sd' => 1.9],
                58 => ['median' => 17.9, 'sd' => 2.0],
                59 => ['median' => 18.0, 'sd' => 2.0],
                60 => ['median' => 18.2, 'sd' => 2.0],
            ];
        }
    }

    /**
     * Get WHO reference values for Height-for-Age (WHO 2006 Standards)
     * Based on official WHO Child Growth Standards 2006
     * Age range: 0-60 months
     */
    private function getHFAReference(int $ageInDays, string $gender): ?array
    {
        $ageInMonths = round($ageInDays / 30.44);
        
        if ($ageInMonths < 0 || $ageInMonths > 60) {
            return null;
        }

        $references = $this->getHFATable($gender);
        
        if (!isset($references[$ageInMonths])) {
            return null;
        }

        return $references[$ageInMonths];
    }

    /**
     * WHO Height-for-Age reference table
     */
    private function getHFATable(string $gender): array
    {
        if ($gender === 'L') {
            // Male Height-for-Age (cm) - Median and SD
            return [
                0 => ['median' => 49.9, 'sd' => 1.9],
                1 => ['median' => 54.7, 'sd' => 2.0],
                2 => ['median' => 58.4, 'sd' => 2.1],
                3 => ['median' => 61.4, 'sd' => 2.1],
                4 => ['median' => 63.9, 'sd' => 2.2],
                5 => ['median' => 65.9, 'sd' => 2.2],
                6 => ['median' => 67.6, 'sd' => 2.2],
                7 => ['median' => 69.2, 'sd' => 2.3],
                8 => ['median' => 70.6, 'sd' => 2.3],
                9 => ['median' => 72.0, 'sd' => 2.3],
                10 => ['median' => 73.3, 'sd' => 2.3],
                11 => ['median' => 74.5, 'sd' => 2.4],
                12 => ['median' => 75.7, 'sd' => 2.4],
                13 => ['median' => 76.9, 'sd' => 2.4],
                14 => ['median' => 78.0, 'sd' => 2.5],
                15 => ['median' => 79.1, 'sd' => 2.5],
                16 => ['median' => 80.2, 'sd' => 2.5],
                17 => ['median' => 81.2, 'sd' => 2.5],
                18 => ['median' => 82.3, 'sd' => 2.6],
                19 => ['median' => 83.2, 'sd' => 2.6],
                20 => ['median' => 84.2, 'sd' => 2.6],
                21 => ['median' => 85.1, 'sd' => 2.6],
                22 => ['median' => 86.0, 'sd' => 2.7],
                23 => ['median' => 86.9, 'sd' => 2.7],
                24 => ['median' => 87.8, 'sd' => 2.7],
                25 => ['median' => 88.0, 'sd' => 2.8],
                26 => ['median' => 88.8, 'sd' => 2.8],
                27 => ['median' => 89.6, 'sd' => 2.8],
                28 => ['median' => 90.4, 'sd' => 2.9],
                29 => ['median' => 91.2, 'sd' => 2.9],
                30 => ['median' => 91.9, 'sd' => 2.9],
                31 => ['median' => 92.7, 'sd' => 3.0],
                32 => ['median' => 93.4, 'sd' => 3.0],
                33 => ['median' => 94.1, 'sd' => 3.0],
                34 => ['median' => 94.8, 'sd' => 3.1],
                35 => ['median' => 95.4, 'sd' => 3.1],
                36 => ['median' => 96.1, 'sd' => 3.1],
                37 => ['median' => 96.7, 'sd' => 3.2],
                38 => ['median' => 97.4, 'sd' => 3.2],
                39 => ['median' => 98.0, 'sd' => 3.3],
                40 => ['median' => 98.6, 'sd' => 3.3],
                41 => ['median' => 99.2, 'sd' => 3.3],
                42 => ['median' => 99.9, 'sd' => 3.4],
                43 => ['median' => 100.4, 'sd' => 3.4],
                44 => ['median' => 101.0, 'sd' => 3.4],
                45 => ['median' => 101.6, 'sd' => 3.5],
                46 => ['median' => 102.2, 'sd' => 3.5],
                47 => ['median' => 102.8, 'sd' => 3.5],
                48 => ['median' => 103.3, 'sd' => 3.6],
                49 => ['median' => 103.9, 'sd' => 3.6],
                50 => ['median' => 104.4, 'sd' => 3.6],
                51 => ['median' => 105.0, 'sd' => 3.7],
                52 => ['median' => 105.6, 'sd' => 3.7],
                53 => ['median' => 106.1, 'sd' => 3.7],
                54 => ['median' => 106.7, 'sd' => 3.8],
                55 => ['median' => 107.2, 'sd' => 3.8],
                56 => ['median' => 107.8, 'sd' => 3.8],
                57 => ['median' => 108.3, 'sd' => 3.9],
                58 => ['median' => 108.9, 'sd' => 3.9],
                59 => ['median' => 109.4, 'sd' => 3.9],
                60 => ['median' => 110.0, 'sd' => 4.0],
            ];
        } else {
            // Female Height-for-Age (cm) - Median and SD
            return [
                0 => ['median' => 49.1, 'sd' => 1.9],
                1 => ['median' => 53.7, 'sd' => 2.0],
                2 => ['median' => 57.1, 'sd' => 2.0],
                3 => ['median' => 59.8, 'sd' => 2.1],
                4 => ['median' => 62.1, 'sd' => 2.1],
                5 => ['median' => 64.0, 'sd' => 2.2],
                6 => ['median' => 65.7, 'sd' => 2.2],
                7 => ['median' => 67.3, 'sd' => 2.2],
                8 => ['median' => 68.7, 'sd' => 2.3],
                9 => ['median' => 70.1, 'sd' => 2.3],
                10 => ['median' => 71.5, 'sd' => 2.3],
                11 => ['median' => 72.8, 'sd' => 2.4],
                12 => ['median' => 74.0, 'sd' => 2.4],
                13 => ['median' => 75.2, 'sd' => 2.4],
                14 => ['median' => 76.4, 'sd' => 2.5],
                15 => ['median' => 77.5, 'sd' => 2.5],
                16 => ['median' => 78.6, 'sd' => 2.5],
                17 => ['median' => 79.7, 'sd' => 2.5],
                18 => ['median' => 80.7, 'sd' => 2.6],
                19 => ['median' => 81.7, 'sd' => 2.6],
                20 => ['median' => 82.7, 'sd' => 2.6],
                21 => ['median' => 83.7, 'sd' => 2.6],
                22 => ['median' => 84.6, 'sd' => 2.7],
                23 => ['median' => 85.5, 'sd' => 2.7],
                24 => ['median' => 86.4, 'sd' => 2.7],
                25 => ['median' => 86.6, 'sd' => 2.8],
                26 => ['median' => 87.4, 'sd' => 2.8],
                27 => ['median' => 88.3, 'sd' => 2.8],
                28 => ['median' => 89.1, 'sd' => 2.9],
                29 => ['median' => 89.9, 'sd' => 2.9],
                30 => ['median' => 90.7, 'sd' => 2.9],
                31 => ['median' => 91.4, 'sd' => 3.0],
                32 => ['median' => 92.2, 'sd' => 3.0],
                33 => ['median' => 92.9, 'sd' => 3.0],
                34 => ['median' => 93.6, 'sd' => 3.1],
                35 => ['median' => 94.4, 'sd' => 3.1],
                36 => ['median' => 95.1, 'sd' => 3.1],
                37 => ['median' => 95.7, 'sd' => 3.2],
                38 => ['median' => 96.4, 'sd' => 3.2],
                39 => ['median' => 97.1, 'sd' => 3.2],
                40 => ['median' => 97.7, 'sd' => 3.3],
                41 => ['median' => 98.4, 'sd' => 3.3],
                42 => ['median' => 99.0, 'sd' => 3.3],
                43 => ['median' => 99.7, 'sd' => 3.4],
                44 => ['median' => 100.3, 'sd' => 3.4],
                45 => ['median' => 100.9, 'sd' => 3.4],
                46 => ['median' => 101.5, 'sd' => 3.5],
                47 => ['median' => 102.1, 'sd' => 3.5],
                48 => ['median' => 102.7, 'sd' => 3.5],
                49 => ['median' => 103.3, 'sd' => 3.6],
                50 => ['median' => 103.9, 'sd' => 3.6],
                51 => ['median' => 104.5, 'sd' => 3.6],
                52 => ['median' => 105.0, 'sd' => 3.7],
                53 => ['median' => 105.6, 'sd' => 3.7],
                54 => ['median' => 106.2, 'sd' => 3.7],
                55 => ['median' => 106.7, 'sd' => 3.8],
                56 => ['median' => 107.3, 'sd' => 3.8],
                57 => ['median' => 107.8, 'sd' => 3.8],
                58 => ['median' => 108.4, 'sd' => 3.9],
                59 => ['median' => 108.9, 'sd' => 3.9],
                60 => ['median' => 109.4, 'sd' => 3.9],
            ];
        }
    }

    /**
     * Get WHO reference values for Weight-for-Height (WHO 2006 Standards)
     * Based on official WHO Child Growth Standards 2006
     * Height range: 45-120 cm (0.5cm intervals)
     */
    private function getWFHReference(float $height, string $gender): ?array
    {
        // Round to nearest 0.5 cm
        $height = round($height * 2) / 2;
        
        if ($height < 45 || $height > 120) {
            return null;
        }

        $references = $this->getWFHTable($gender);
        
        if (!isset($references[$height])) {
            return null;
        }

        return $references[$height];
    }

    /**
     * WHO Weight-for-Height reference table (condensed - key heights only)
     * For production, use complete table with 0.5cm intervals
     */
    private function getWFHTable(string $gender): array
    {
        if ($gender === 'L') {
            // Male Weight-for-Height (kg) - Median and SD
            // Sample values at 1cm intervals (simplified from 0.5cm intervals)
            return [
                45.0 => ['median' => 2.4, 'sd' => 0.3],
                46.0 => ['median' => 2.5, 'sd' => 0.3],
                47.0 => ['median' => 2.6, 'sd' => 0.3],
                48.0 => ['median' => 2.7, 'sd' => 0.3],
                49.0 => ['median' => 2.9, 'sd' => 0.3],
                50.0 => ['median' => 3.1, 'sd' => 0.4],
                51.0 => ['median' => 3.3, 'sd' => 0.4],
                52.0 => ['median' => 3.5, 'sd' => 0.4],
                53.0 => ['median' => 3.8, 'sd' => 0.4],
                54.0 => ['median' => 4.0, 'sd' => 0.4],
                55.0 => ['median' => 4.3, 'sd' => 0.4],
                56.0 => ['median' => 4.5, 'sd' => 0.5],
                57.0 => ['median' => 4.8, 'sd' => 0.5],
                58.0 => ['median' => 5.1, 'sd' => 0.5],
                59.0 => ['median' => 5.3, 'sd' => 0.5],
                60.0 => ['median' => 5.6, 'sd' => 0.5],
                61.0 => ['median' => 5.9, 'sd' => 0.5],
                62.0 => ['median' => 6.1, 'sd' => 0.5],
                63.0 => ['median' => 6.4, 'sd' => 0.6],
                64.0 => ['median' => 6.7, 'sd' => 0.6],
                65.0 => ['median' => 6.9, 'sd' => 0.6],
                66.0 => ['median' => 7.2, 'sd' => 0.6],
                67.0 => ['median' => 7.4, 'sd' => 0.6],
                68.0 => ['median' => 7.7, 'sd' => 0.6],
                69.0 => ['median' => 7.9, 'sd' => 0.6],
                70.0 => ['median' => 8.2, 'sd' => 0.7],
                71.0 => ['median' => 8.4, 'sd' => 0.7],
                72.0 => ['median' => 8.6, 'sd' => 0.7],
                73.0 => ['median' => 8.9, 'sd' => 0.7],
                74.0 => ['median' => 9.1, 'sd' => 0.7],
                75.0 => ['median' => 9.4, 'sd' => 0.7],
                76.0 => ['median' => 9.6, 'sd' => 0.8],
                77.0 => ['median' => 9.9, 'sd' => 0.8],
                78.0 => ['median' => 10.1, 'sd' => 0.8],
                79.0 => ['median' => 10.4, 'sd' => 0.8],
                80.0 => ['median' => 10.7, 'sd' => 0.8],
                81.0 => ['median' => 10.9, 'sd' => 0.9],
                82.0 => ['median' => 11.2, 'sd' => 0.9],
                83.0 => ['median' => 11.5, 'sd' => 0.9],
                84.0 => ['median' => 11.7, 'sd' => 0.9],
                85.0 => ['median' => 12.0, 'sd' => 1.0],
                86.0 => ['median' => 12.3, 'sd' => 1.0],
                87.0 => ['median' => 12.6, 'sd' => 1.0],
                88.0 => ['median' => 12.9, 'sd' => 1.1],
                89.0 => ['median' => 13.1, 'sd' => 1.1],
                90.0 => ['median' => 13.4, 'sd' => 1.1],
                91.0 => ['median' => 13.7, 'sd' => 1.2],
                92.0 => ['median' => 14.0, 'sd' => 1.2],
                93.0 => ['median' => 14.3, 'sd' => 1.2],
                94.0 => ['median' => 14.6, 'sd' => 1.3],
                95.0 => ['median' => 14.9, 'sd' => 1.3],
                96.0 => ['median' => 15.2, 'sd' => 1.3],
                97.0 => ['median' => 15.5, 'sd' => 1.4],
                98.0 => ['median' => 15.8, 'sd' => 1.4],
                99.0 => ['median' => 16.1, 'sd' => 1.4],
                100.0 => ['median' => 16.4, 'sd' => 1.5],
                101.0 => ['median' => 16.8, 'sd' => 1.5],
                102.0 => ['median' => 17.1, 'sd' => 1.6],
                103.0 => ['median' => 17.4, 'sd' => 1.6],
                104.0 => ['median' => 17.8, 'sd' => 1.7],
                105.0 => ['median' => 18.1, 'sd' => 1.7],
                106.0 => ['median' => 18.5, 'sd' => 1.8],
                107.0 => ['median' => 18.8, 'sd' => 1.8],
                108.0 => ['median' => 19.2, 'sd' => 1.9],
                109.0 => ['median' => 19.6, 'sd' => 1.9],
                110.0 => ['median' => 20.0, 'sd' => 2.0],
                111.0 => ['median' => 20.3, 'sd' => 2.1],
                112.0 => ['median' => 20.7, 'sd' => 2.1],
                113.0 => ['median' => 21.1, 'sd' => 2.2],
                114.0 => ['median' => 21.6, 'sd' => 2.3],
                115.0 => ['median' => 22.0, 'sd' => 2.3],
                116.0 => ['median' => 22.4, 'sd' => 2.4],
                117.0 => ['median' => 22.9, 'sd' => 2.5],
                118.0 => ['median' => 23.3, 'sd' => 2.6],
                119.0 => ['median' => 23.8, 'sd' => 2.6],
                120.0 => ['median' => 24.2, 'sd' => 2.7],
            ];
        } else {
            // Female Weight-for-Height (kg) - Median and SD
            return [
                45.0 => ['median' => 2.3, 'sd' => 0.3],
                46.0 => ['median' => 2.4, 'sd' => 0.3],
                47.0 => ['median' => 2.5, 'sd' => 0.3],
                48.0 => ['median' => 2.6, 'sd' => 0.3],
                49.0 => ['median' => 2.8, 'sd' => 0.3],
                50.0 => ['median' => 2.9, 'sd' => 0.3],
                51.0 => ['median' => 3.2, 'sd' => 0.4],
                52.0 => ['median' => 3.4, 'sd' => 0.4],
                53.0 => ['median' => 3.6, 'sd' => 0.4],
                54.0 => ['median' => 3.9, 'sd' => 0.4],
                55.0 => ['median' => 4.2, 'sd' => 0.4],
                56.0 => ['median' => 4.4, 'sd' => 0.4],
                57.0 => ['median' => 4.7, 'sd' => 0.5],
                58.0 => ['median' => 4.9, 'sd' => 0.5],
                59.0 => ['median' => 5.2, 'sd' => 0.5],
                60.0 => ['median' => 5.5, 'sd' => 0.5],
                61.0 => ['median' => 5.7, 'sd' => 0.5],
                62.0 => ['median' => 6.0, 'sd' => 0.5],
                63.0 => ['median' => 6.3, 'sd' => 0.5],
                64.0 => ['median' => 6.5, 'sd' => 0.6],
                65.0 => ['median' => 6.8, 'sd' => 0.6],
                66.0 => ['median' => 7.1, 'sd' => 0.6],
                67.0 => ['median' => 7.3, 'sd' => 0.6],
                68.0 => ['median' => 7.6, 'sd' => 0.6],
                69.0 => ['median' => 7.8, 'sd' => 0.6],
                70.0 => ['median' => 8.1, 'sd' => 0.6],
                71.0 => ['median' => 8.3, 'sd' => 0.7],
                72.0 => ['median' => 8.6, 'sd' => 0.7],
                73.0 => ['median' => 8.8, 'sd' => 0.7],
                74.0 => ['median' => 9.1, 'sd' => 0.7],
                75.0 => ['median' => 9.3, 'sd' => 0.7],
                76.0 => ['median' => 9.6, 'sd' => 0.7],
                77.0 => ['median' => 9.8, 'sd' => 0.8],
                78.0 => ['median' => 10.1, 'sd' => 0.8],
                79.0 => ['median' => 10.3, 'sd' => 0.8],
                80.0 => ['median' => 10.6, 'sd' => 0.8],
                81.0 => ['median' => 10.9, 'sd' => 0.9],
                82.0 => ['median' => 11.1, 'sd' => 0.9],
                83.0 => ['median' => 11.4, 'sd' => 0.9],
                84.0 => ['median' => 11.7, 'sd' => 1.0],
                85.0 => ['median' => 12.0, 'sd' => 1.0],
                86.0 => ['median' => 12.2, 'sd' => 1.0],
                87.0 => ['median' => 12.5, 'sd' => 1.1],
                88.0 => ['median' => 12.8, 'sd' => 1.1],
                89.0 => ['median' => 13.1, 'sd' => 1.1],
                90.0 => ['median' => 13.4, 'sd' => 1.2],
                91.0 => ['median' => 13.7, 'sd' => 1.2],
                92.0 => ['median' => 14.0, 'sd' => 1.2],
                93.0 => ['median' => 14.3, 'sd' => 1.3],
                94.0 => ['median' => 14.6, 'sd' => 1.3],
                95.0 => ['median' => 14.9, 'sd' => 1.4],
                96.0 => ['median' => 15.2, 'sd' => 1.4],
                97.0 => ['median' => 15.5, 'sd' => 1.4],
                98.0 => ['median' => 15.8, 'sd' => 1.5],
                99.0 => ['median' => 16.2, 'sd' => 1.5],
                100.0 => ['median' => 16.5, 'sd' => 1.6],
                101.0 => ['median' => 16.8, 'sd' => 1.6],
                102.0 => ['median' => 17.2, 'sd' => 1.7],
                103.0 => ['median' => 17.5, 'sd' => 1.7],
                104.0 => ['median' => 17.9, 'sd' => 1.8],
                105.0 => ['median' => 18.2, 'sd' => 1.8],
                106.0 => ['median' => 18.6, 'sd' => 1.9],
                107.0 => ['median' => 19.0, 'sd' => 2.0],
                108.0 => ['median' => 19.4, 'sd' => 2.0],
                109.0 => ['median' => 19.8, 'sd' => 2.1],
                110.0 => ['median' => 20.2, 'sd' => 2.2],
                111.0 => ['median' => 20.6, 'sd' => 2.2],
                112.0 => ['median' => 21.0, 'sd' => 2.3],
                113.0 => ['median' => 21.4, 'sd' => 2.4],
                114.0 => ['median' => 21.9, 'sd' => 2.5],
                115.0 => ['median' => 22.3, 'sd' => 2.5],
                116.0 => ['median' => 22.8, 'sd' => 2.6],
                117.0 => ['median' => 23.2, 'sd' => 2.7],
                118.0 => ['median' => 23.7, 'sd' => 2.8],
                119.0 => ['median' => 24.2, 'sd' => 2.9],
                120.0 => ['median' => 24.6, 'sd' => 3.0],
            ];
        }
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

