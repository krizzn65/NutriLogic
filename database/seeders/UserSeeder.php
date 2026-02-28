<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Posyandu;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Creates 1 Admin, 2 Kaders, and 3 Parents for testing.
     */
    public function run(): void
    {
        $this->command->info('Creating Users...');

        $posyandu1 = Posyandu::where('name', 'Posyandu Mawar Sehat')->first();
        $posyandu2 = Posyandu::where('name', 'Posyandu Melati Indah')->first();

        // Admin
        User::create([
            'name' => 'Admin NutriLogic',
            'email' => 'admin@nutrilogic.com',
            'phone' => '081234567890',
            'password' => 'Admin123',
            'role' => 'admin',
            'posyandu_id' => null,
            'is_active' => true,
            'points' => 0,
            'last_seen_at' => now(),
        ]);

        // Kader 1 - Posyandu Mawar
        User::create([
            'name' => 'Siti Kader',
            'email' => 'kader@nutrilogic.com',
            'phone' => '081234567891',
            'password' => 'Kader123',
            'role' => 'kader',
            'posyandu_id' => $posyandu1->id,
            'is_active' => true,
            'points' => 500,
            'address' => 'Jl. Posyandu No. 1',
            'rt' => '01',
            'rw' => '02',
            'last_seen_at' => now()->subMinutes(2),
        ]);

        // Kader 2 - Posyandu Melati
        User::create([
            'name' => 'Dewi Kader',
            'email' => 'kader2@nutrilogic.com',
            'phone' => '081234567894',
            'password' => 'Kader123',
            'role' => 'kader',
            'posyandu_id' => $posyandu2->id,
            'is_active' => true,
            'points' => 300,
            'address' => 'Jl. Melati No. 5',
            'rt' => '03',
            'rw' => '01',
            'last_seen_at' => now()->subHours(1),
        ]);

        // Parent 1 - Ratna: Active user, high points, PMT compliant children (ELIGIBLE for rewards)
        User::create([
            'name' => 'Ratna Dewi',
            'email' => 'ratna@gmail.com',
            'phone' => '081234567892',
            'password' => 'Parent123',
            'role' => 'ibu',
            'posyandu_id' => $posyandu1->id,
            'is_active' => true,
            'points' => 5500, // High points - qualifies for points_5000 badge
            'address' => 'Jl. Mawar No. 10',
            'rt' => '01',
            'rw' => '02',
            'last_seen_at' => now()->subMinutes(5),
        ]);

        // Parent 2 - Wulan: Medium activity, some non-compliant children
        User::create([
            'name' => 'Wulan Sari',
            'email' => 'wulan@gmail.com',
            'phone' => '081234567893',
            'password' => 'Parent123',
            'role' => 'ibu',
            'posyandu_id' => $posyandu1->id,
            'is_active' => true,
            'points' => 1200, // Medium points - qualifies for points_1000 badge
            'address' => 'Jl. Mawar No. 15',
            'rt' => '02',
            'rw' => '02',
            'last_seen_at' => now()->subHours(2),
        ]);

        // Parent 3 - Ani: Posyandu 2, mixed compliance
        User::create([
            'name' => 'Ani Susanti',
            'email' => 'ani@gmail.com',
            'phone' => '081234567895',
            'password' => 'Parent123',
            'role' => 'ibu',
            'posyandu_id' => $posyandu2->id,
            'is_active' => true,
            'points' => 350, // Lower points - no points badge yet
            'address' => 'Jl. Melati No. 20',
            'rt' => '03',
            'rw' => '01',
            'last_seen_at' => now()->subDays(1),
        ]);

        $this->command->info('✓ Created 6 Users (1 Admin, 2 Kaders, 3 Parents)');
    }
}
