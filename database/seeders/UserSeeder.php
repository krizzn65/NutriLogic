<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Posyandu;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $posyandu = Posyandu::first();

        // Admin (opsional)
        User::create([
            'name'     => 'Admin NutriLogic',
            'email'    => 'admin@nutrilogic.test',
            'password' => Hash::make('password123'),
            'role'     => 'admin',
        ]);

        // Kader
        User::create([
            'name'        => 'Kader Siti',
            'email'       => 'kader@nutrilogic.test',
            'password'    => Hash::make('password123'),
            'role'        => 'kader',
            'posyandu_id' => $posyandu->id,
        ]);

        // Ibu
        User::create([
            'name'     => 'Ibu Ani',
            'email'    => 'ibu@nutrilogic.test',
            'password' => Hash::make('password123'),
            'role'     => 'ibu',
        ]);
    }
}
