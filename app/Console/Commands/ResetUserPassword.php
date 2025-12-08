<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class ResetUserPassword extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'user:reset-password {phone} {password}';

    /**
     * The console command description.
     */
    protected $description = 'Reset password for a user by phone number';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $phone = $this->argument('phone');
        $password = $this->argument('password');

        $user = User::where('phone', $phone)->first();

        if (!$user) {
            $this->error("User with phone {$phone} not found!");
            return 1;
        }

        // Model cast will automatically hash the password
        $user->password = $password;
        $user->save();

        $this->info("Password reset successfully for: {$user->name}");
        return 0;
    }
}
