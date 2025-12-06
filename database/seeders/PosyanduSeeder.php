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
        $posyandus = [
            [
                'name'    => 'Posyandu Bougenville 1',
                'village' => 'Desa Kaliwining',
                'address' => 'RT 01 RW 02, Desa Kaliwining',
                'city'    => 'Kabupaten Jember',
            ],
            [
                'name'    => 'Posyandu Bougenville 2',
                'village' => 'Desa Kaliwining',
                'address' => 'RT 03 RW 04, Desa Kaliwining',
                'city'    => 'Kabupaten Jember',
            ],
            [
                'name'    => 'Posyandu Melati',
                'village' => 'Desa Sukowiryo',
                'address' => 'RT 05 RW 06, Desa Sukowiryo',
                'city'    => 'Kabupaten Jember',
            ],
            [
                'name'    => 'Posyandu Mawar',
                'village' => 'Desa Tegalsari',
                'address' => 'RT 02 RW 03, Desa Tegalsari',
                'city'    => 'Kabupaten Jember',
            ],
            [
                'name'    => 'Posyandu Anggrek',
                'village' => 'Desa Sumberbaru',
                'address' => 'RT 04 RW 05, Desa Sumberbaru',
                'city'    => 'Kabupaten Jember',
            ],
        ];

        foreach ($posyandus as $data) {
            Posyandu::create($data);
        }
    }
}
