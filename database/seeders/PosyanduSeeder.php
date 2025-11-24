<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Posyandu;

class PosyanduSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Posyandu::create([
            'name'    => 'Posyandu Bougenville 1',
            'village' => 'Desa Kaliwining',
            'address' => 'RT 01 RW 02, Desa Kaliwining',
            'city'    => 'Kabupaten Jember',
        ]);

        Posyandu::create([
            'name'    => 'Posyandu Bougenville 2',
            'village' => 'Desa Kaliwining',
            'address' => 'RT 03 RW 04, Desa Kaliwining',
            'city'    => 'Kabupaten Jember',
        ]);
    }
}
