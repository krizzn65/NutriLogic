<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Posyandu;
use App\Models\Notification;
use App\Models\ActivityLog;
use App\Models\BroadcastLog;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class SystemSeeder extends Seeder
{
    public function run(): void
    {
        $this->createNotifications();
        $this->createActivityLogs();
        $this->createBroadcastLogs();
    }

    private function createNotifications(): void
    {
        $this->command->info('Creating Notifications...');

        $parents = User::where('role', 'ibu')->get();
        $kaders = User::where('role', 'kader')->get();

        $templates = [
            ['type' => 'schedule', 'title' => 'Jadwal Posyandu', 'message' => 'Jangan lupa jadwal posyandu besok pukul 08:00'],
            ['type' => 'reminder', 'title' => 'Pengingat Penimbangan', 'message' => 'Sudah waktunya menimbang anak Anda'],
            ['type' => 'pmt', 'title' => 'PMT Hari Ini', 'message' => 'Jangan lupa catat konsumsi PMT anak'],
            ['type' => 'badge', 'title' => 'Badge Baru!', 'message' => 'Selamat! Anda mendapatkan badge baru'],
            ['type' => 'consultation', 'title' => 'Pesan Baru', 'message' => 'Anda memiliki pesan baru dari kader'],
        ];

        $count = 0;
        foreach ($parents as $parent) {
            // Vary notification count by activity
            $numNotif = str_contains($parent->email, 'ratna') ? 10 : (str_contains($parent->email, 'wulan') ? 6 : 3);
            
            for ($i = 0; $i < $numNotif; $i++) {
                $t = $templates[array_rand($templates)];
                $isRead = rand(0, 1);
                $createdAt = Carbon::now()->subDays(rand(0, 14))->subHours(rand(0, 12));
                
                Notification::create([
                    'user_id' => $parent->id,
                    'type' => $t['type'],
                    'title' => $t['title'],
                    'message' => $t['message'],
                    'is_read' => $isRead,
                    'read_at' => $isRead ? $createdAt->copy()->addHours(rand(1, 6)) : null,
                    'created_at' => $createdAt,
                ]);
                $count++;
            }
        }

        foreach ($kaders as $kader) {
            for ($i = 0; $i < 5; $i++) {
                $t = $templates[array_rand($templates)];
                Notification::create([
                    'user_id' => $kader->id,
                    'type' => $t['type'],
                    'title' => $t['title'],
                    'message' => $t['message'],
                    'is_read' => rand(0, 1),
                    'created_at' => Carbon::now()->subDays(rand(0, 7)),
                ]);
                $count++;
            }
        }

        $this->command->info("✓ Created {$count} Notifications");
    }

    private function createActivityLogs(): void
    {
        $this->command->info('Creating Activity Logs...');

        $allUsers = User::all();
        $actions = [
            ['action' => 'login', 'model' => 'User', 'description' => 'User logged in'],
            ['action' => 'create', 'model' => 'MealLog', 'description' => 'Created meal log'],
            ['action' => 'create', 'model' => 'WeighingLog', 'description' => 'Created weighing log'],
            ['action' => 'update', 'model' => 'Child', 'description' => 'Updated child data'],
            ['action' => 'create', 'model' => 'Consultation', 'description' => 'Started consultation'],
            ['action' => 'create', 'model' => 'PmtLog', 'description' => 'Recorded PMT consumption'],
        ];

        for ($i = 0; $i < 50; $i++) {
            $user = $allUsers->random();
            $action = $actions[array_rand($actions)];
            
            ActivityLog::create([
                'user_id' => $user->id,
                'action' => $action['action'],
                'model' => $action['model'],
                'model_id' => rand(1, 20),
                'description' => $action['description'],
                'ip_address' => '192.168.1.' . rand(1, 255),
                'metadata' => json_encode(['browser' => 'Chrome', 'platform' => 'Windows']),
                'created_at' => Carbon::now()->subDays(rand(0, 30))->subHours(rand(0, 23)),
            ]);
        }

        $this->command->info('✓ Created 50 Activity Logs');
    }

    private function createBroadcastLogs(): void
    {
        $this->command->info('Creating Broadcast Logs...');

        $posyandus = Posyandu::all();
        $kaders = User::where('role', 'kader')->get();

        $messages = [
            ['message' => 'Pengingat: Jadwal posyandu besok pukul 08:00.', 'type' => 'jadwal_posyandu'],
            ['message' => 'Info: Pemberian vitamin A minggu depan.', 'type' => 'info_gizi'],
            ['message' => 'Penting: Pastikan anak mengonsumsi PMT setiap hari.', 'type' => 'info_gizi'],
        ];

        $count = 0;
        foreach ($posyandus as $posyandu) {
            $kader = $kaders->first(fn($k) => $k->posyandu_id === $posyandu->id) ?? $kaders->first();
            
            foreach ($messages as $m) {
                BroadcastLog::create([
                    'posyandu_id' => $posyandu->id,
                    'sender_id' => $kader->id,
                    'message' => $m['message'],
                    'type' => $m['type'],
                    'created_at' => Carbon::now()->subDays(rand(1, 14)),
                ]);
                $count++;
            }
        }

        $this->command->info("✓ Created {$count} Broadcast Logs");
    }
}
