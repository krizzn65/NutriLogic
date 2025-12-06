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
        $parents = User::where('role', 'ibu')->get();
        $posyandus = Posyandu::all();

        $childNames = [
            // Laki-laki
            'Ahmad Rizki',
            'Budi Santoso',
            'Cahya Permana',
            'Dani Pratama',
            'Eko Saputra',
            'Fajar Nugraha',
            'Galih Ramadan',
            'Hadi Wijaya',
            'Irfan Hakim',
            'Joko Susilo',
            'Kiki Amalia',
            'Lukman Hakim',
            'Made Sudarsana',
            'Nanda Pratama',
            'Omar Bakri',
            'Putra Mandiri',
            'Qori Sandioriva',
            'Rangga Sasana',
            'Satria Baja',
            'Teguh Santoso',
            'Umar Khalid',
            'Vino Bastian',
            'Wahyu Nugroho',
            'Yoga Pratama',
            'Zaki Abdullah',
            // Perempuan
            'Aisha Putri',
            'Bella Saphira',
            'Cinta Kuya',
            'Dewi Persik',
            'Elsa Frozen',
            'Fitria Rasyidi',
            'Gita Gutawa',
            'Hana Madness',
            'Intan Nuraini',
            'Jasmine Villegas',
            'Kiara Putri',
            'Lala Karmela',
            'Mawar Melati',
            'Nina Zatulini',
            'Olivia Zalianty',
            'Prita Mulyasari',
            'Qonita Ginting',
            'Rossa Roslaina',
            'Siti Badriah',
            'Tasya Kamila',
            'Ussy Sulistiawaty',
            'Vanesha Prescilla',
            'Widya Saputra',
            'Yuki Kato',
            'Zara Adhisty',
            // Tambahan
            'Aldi Taher',
            'Bagas Ran',
            'Cakra Khan',
            'Desta Vincent',
            'Erick Estrada',
            'Fadli Zon',
            'Gilang Dirga',
            'Hamish Daud',
            'Ifan Seventeen',
            'Judika Sihotang',
            'Keanu Agl',
            'Lesti Kejora',
            'Momo Geisha',
            'Naysilla Mirdad',
            'Oka Antara',
            'Pevita Pearce',
            'Raline Shah',
            'Syahrini Princess',
            'Tara Basro',
            'Vidi Aldiano',
            'Wendy Cagur',
            'Yura Yunita',
            'Aurel Hermansyah',
            'Billar Qhia',
            'Celine Evangelista',
            'Dinda Hauw',
            'Erika Carlina',
            'Febby Rastanty',
            'Gading Marten',
            'Happy Salma',
            'Indah Permatasari',
            'Jessica Mila',
            'Kevin Julio',
            'Lucinta Luna',
            'Michelle Ziudith',
            'Natasha Wilona',
            'Amanda Manopo',
            'Brisia Jodie',
            'Chelsea Islan',
            'Dian Sastro',
            'Enzy Storia',
            'Faradina Mufti',
            'Gritte Agatha',
            'Hanggini Purinda',
            'Irish Bella',
        ];

        $genders = ['L', 'P'];
        $statuses = [true, true, true, true, false]; // 80% aktif

        foreach ($parents as $index => $parent) {
            // Setiap parent punya 1-3 anak
            $childCount = rand(1, 3);

            for ($i = 0; $i < $childCount; $i++) {
                $childIndex = ($index * 3) + $i;
                if ($childIndex >= count($childNames)) break;

                $gender = $genders[array_rand($genders)];
                $birthDate = now()->subMonths(rand(6, 60))->format('Y-m-d'); // 6-60 bulan

                Child::create([
                    'parent_id'       => $parent->id,
                    'posyandu_id'     => $parent->posyandu_id,
                    'full_name'       => $childNames[$childIndex],
                    'birth_date'      => $birthDate,
                    'gender'          => $gender,
                    'birth_weight_kg' => rand(25, 40) / 10, // 2.5 - 4.0 kg
                    'birth_height_cm' => rand(45, 53), // 45 - 53 cm
                    'is_active'       => $statuses[array_rand($statuses)],
                ]);
            }
        }

        // Pastikan user test punya 30 anak untuk testing pagination
        $testParent = User::where('email', 'ibu@ibu.com')->first();
        if ($testParent) {
            $testChildNames = [
                'Budi Setiawan',
                'Siti Nurhaliza',
                'Agus Salim',
                'Mega Putri',
                'Riko Pratama',
                'Lina Marlina',
                'Doni Saputra',
                'Nina Agustina',
                'Rudi Hermawan',
                'Dewi Sartika',
                'Bayu Anggara',
                'Citra Kirana',
                'Eko Prasetyo',
                'Fitri Handayani',
                'Gani Wijaya',
                'Hana Pertiwi',
                'Irfan Maulana',
                'Juwita Rahayu',
                'Krisna Mukti',
                'Laila Sari',
                'Made Wirawan',
                'Nita Puspita',
                'Omar Abdullah',
                'Putri Ayu',
                'Qori Maheswara',
                'Rani Mulyani',
                'Satria Baja',
                'Tuti Suryani',
                'Udin Petot',
                'Vina Safitri',
            ];

            foreach ($testChildNames as $index => $childName) {
                Child::create([
                    'parent_id'       => $testParent->id,
                    'posyandu_id'     => $testParent->posyandu_id,
                    'full_name'       => $childName,
                    'birth_date'      => now()->subMonths(rand(6, 60))->format('Y-m-d'),
                    'gender'          => $genders[array_rand($genders)],
                    'birth_weight_kg' => rand(25, 40) / 10,
                    'birth_height_cm' => rand(45, 53),
                    'is_active'       => $statuses[array_rand($statuses)],
                ]);
            }
        }
    }
}
