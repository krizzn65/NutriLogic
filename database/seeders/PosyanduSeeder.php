<?php

namespace Database\Seeders;

use App\Models\Posyandu;
use Illuminate\Database\Seeder;

class PosyanduSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Creates 2 Posyandus for testing multi-posyandu features.
     */
    public function run(): void
    {
        $this->command->info('Creating Posyandus...');

        Posyandu::create([
            'name' => 'Posyandu Mawar Sehat',
            'village' => 'Desa Sukamaju',
            'address' => 'Jl. Kesehatan No. 123, RT 01/RW 02',
            'rt_rw' => '01/02',
            'city' => 'Jember',
            'latitude' => -8.1656,
            'longitude' => 113.7028,
            'is_active' => true,
        ]);

        Posyandu::create([
            'name' => 'Posyandu Melati Indah',
            'village' => 'Desa Sejahtera',
            'address' => 'Jl. Melati No. 45, RT 03/RW 01',
            'rt_rw' => '03/01',
            'city' => 'Jember',
            'latitude' => -8.1700,
            'longitude' => 113.7100,
            'is_active' => true,
        ]);

        $this->command->info('✓ Created 2 Posyandus');
    }
}
