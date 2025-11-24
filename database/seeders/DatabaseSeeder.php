<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            PosyanduSeeder::class,
            UserSeeder::class,
            ChildSeeder::class,
            WeighingLogSeeder::class,
            MealLogSeeder::class,
            ImmunizationScheduleSeeder::class,
        ]);
    }
}
