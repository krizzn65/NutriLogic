<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Child;
use App\Models\Consultation;
use App\Models\ConsultationMessage;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class ConsultationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Creates consultations - more for active parents.
     */
    public function run(): void
    {
        $this->command->info('Creating Consultations...');

        $kader1 = User::where('email', 'kader@nutrilogic.com')->first();
        $kader2 = User::where('email', 'kader2@nutrilogic.com')->first();
        
        $ratna = User::where('email', 'ratna@gmail.com')->first();
        $wulan = User::where('email', 'wulan@gmail.com')->first();
        $ani = User::where('email', 'ani@gmail.com')->first();

        $topics = [
            'Konsultasi tentang pola makan anak',
            'Pertanyaan tentang berat badan anak',
            'Masalah anak susah makan',
            'Konsultasi imunisasi',
            'Pertanyaan tentang MPASI',
        ];

        $parentMsgs = [
            'Selamat pagi Bu, saya ingin konsultasi.',
            'Bu, anak saya susah makan sayur. Bagaimana?',
            'Apakah berat badan anak saya sudah ideal?',
        ];

        $kaderMsgs = [
            'Selamat pagi Ibu. Pastikan anak mendapat gizi seimbang.',
            'Coba variasikan bentuk dan cara penyajian sayur.',
            'Berdasarkan data, berat badan anak Ibu normal.',
        ];

        $consultationCount = 0;
        $messageCount = 0;

        // Helper function to create consultations
        $createConsultation = function($parent, $kader, $count, $includeOpen = true) use (
            &$consultationCount, &$messageCount, $topics, $parentMsgs, $kaderMsgs
        ) {
            $children = Child::where('parent_id', $parent->id)->get();
            if ($children->isEmpty()) return;

            for ($i = 0; $i < $count; $i++) {
                $child = $children->random();
                $status = ($includeOpen && $i === 0) ? 'open' : 'closed';

                $consultation = Consultation::create([
                    'parent_id' => $parent->id,
                    'kader_id' => $kader->id,
                    'child_id' => $child->id,
                    'title' => $topics[$i % count($topics)],
                    'status' => $status,
                    'created_at' => Carbon::now()->subDays(rand(1, 30)),
                ]);
                $consultationCount++;

                // Create 3-6 messages per consultation
                $numMessages = rand(3, 6);
                for ($j = 0; $j < $numMessages; $j++) {
                    $isParent = $j % 2 === 0;
                    ConsultationMessage::create([
                        'consultation_id' => $consultation->id,
                        'sender_id' => $isParent ? $parent->id : $kader->id,
                        'message' => $isParent 
                            ? $parentMsgs[$j % count($parentMsgs)] 
                            : $kaderMsgs[$j % count($kaderMsgs)],
                        'created_at' => $consultation->created_at->addMinutes($j * rand(5, 30)),
                    ]);
                    $messageCount++;
                }
            }
        };

        // Ratna - 3 consultations (1 open, 2 closed) - most active
        $createConsultation($ratna, $kader1, 3, true);

        // Wulan - 2 consultations (1 open, 1 closed)
        $createConsultation($wulan, $kader1, 2, true);

        // Ani - 1 consultation (closed) - least active
        $createConsultation($ani, $kader2, 1, false);

        $this->command->info("✓ Created {$consultationCount} Consultations with {$messageCount} messages");
    }
}
