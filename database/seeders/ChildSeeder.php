<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Child;
use App\Models\User;
use App\Models\Posyandu;

class ChildSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        $ibu     = User::where('role', 'ibu')->first();
        $posyandu = Posyandu::first();

        Child::create([
            'parent_id'       => $ibu->id,
            'posyandu_id'     => $posyandu->id,
            'full_name'       => 'Budi',
            'birth_date'      => '2022-05-10',
            'gender'          => 'L',
            'birth_weight_kg' => 3.2,
            'birth_height_cm' => 49.0,
        ]);
    }
}
