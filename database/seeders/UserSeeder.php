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
        $posyandus = Posyandu::all();

        // Admin
        User::create([
            'name'     => 'Admin NutriLogic',
            'email'    => 'admin@admin.com',
            'password' => Hash::make('admin'),
            'role'     => 'admin',
        ]);

        // Kader untuk setiap posyandu
        $kaderNames = [
            'Kader Siti Nurhaliza',
            'Kader Dewi Sartika',
            'Kader Sri Mulyani',
            'Kader Rina Wijaya',
            'Kader Ani Yudhoyono',
        ];

        foreach ($posyandus as $index => $posyandu) {
            User::create([
                'name'        => $kaderNames[$index] ?? "Kader Posyandu {$posyandu->id}",
                'email'       => "kader{$posyandu->id}@kader.com",
                'password'    => Hash::make('kader'),
                'role'        => 'kader',
                'posyandu_id' => $posyandu->id,
                'phone'       => '08123456' . str_pad($posyandu->id, 4, '0', STR_PAD_LEFT),
            ]);
        }

        // Orang tua (parent) - buat 50 orang tua
        $parentNames = [
            'Ibu Ani Susanti',
            'Ibu Budi Lestari',
            'Ibu Citra Dewi',
            'Ibu Diah Permata',
            'Ibu Eka Wulandari',
            'Ibu Fitri Handayani',
            'Ibu Gita Savitri',
            'Ibu Hana Pertiwi',
            'Ibu Indah Sari',
            'Ibu Juwita Rahayu',
            'Ibu Kartini Putri',
            'Ibu Lina Marlina',
            'Ibu Maya Anggraini',
            'Ibu Nita Puspita',
            'Ibu Okta Wijayanti',
            'Ibu Putri Ayu',
            'Ibu Rani Mulyani',
            'Ibu Sari Rahmawati',
            'Ibu Tuti Suryani',
            'Ibu Umi Kalsum',
            'Ibu Vina Safitri',
            'Ibu Wati Nurjanah',
            'Ibu Yanti Kusuma',
            'Ibu Zahra Amelia',
            'Ibu Ayu Ting Ting',
            'Ibu Bunga Citra',
            'Ibu Cinta Laura',
            'Ibu Dewi Sandra',
            'Ibu Erna Kamelia',
            'Ibu Feby Febiola',
            'Ibu Gisella Anastasia',
            'Ibu Hesti Purwadinata',
            'Ibu Inul Daratista',
            'Ibu Julia Perez',
            'Ibu Krisdayanti',
            'Ibu Luna Maya',
            'Ibu Maia Estianty',
            'Ibu Nagita Slavina',
            'Ibu Olla Ramlan',
            'Ibu Prilly Latuconsina',
            'Ibu Raisa Andriana',
            'Ibu Sandra Dewi',
            'Ibu Titi DJ',
            'Ibu Ucie Sucita',
            'Ibu Vanessa Angel',
            'Ibu Wulan Guritno',
            'Ibu Yuni Shara',
            'Ibu Zaskia Adya Mecca',
            'Ibu Ashanty Hermansyah',
            'Ibu Butet Kartaredjasa',
        ];

        foreach ($parentNames as $index => $name) {
            $posyandu = $posyandus[$index % $posyandus->count()];
            User::create([
                'name'        => $name,
                'email'       => 'parent' . ($index + 1) . '@parent.com',
                'password'    => Hash::make('parent'),
                'role'        => 'ibu',
                'posyandu_id' => $posyandu->id,
                'phone'       => '0812' . str_pad($index + 1, 8, '0', STR_PAD_LEFT),
            ]);
        }

        // Default test account
        User::create([
            'name'        => 'Ibu Test',
            'email'       => 'ibu@ibu.com',
            'password'    => Hash::make('ibu'),
            'role'        => 'ibu',
            'posyandu_id' => $posyandus->first()->id,
            'phone'       => '081234567890',
        ]);

        // Default kader account
        User::create([
            'name'        => 'Kader Test',
            'email'       => 'kader@kader.com',
            'password'    => Hash::make('kader'),
            'role'        => 'kader',
            'posyandu_id' => $posyandus->first()->id,
            'phone'       => '081234567891',
        ]);
    }
}
