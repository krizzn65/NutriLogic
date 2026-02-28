<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Weighing Logs
        Schema::create('weighing_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('child_id');
            $table->date('measured_at');
            $table->decimal('weight_kg', 4, 1);
            $table->decimal('height_cm', 4, 1)->nullable();
            $table->decimal('muac_cm', 4, 1)->nullable();
            $table->decimal('head_circumference_cm', 4, 1)->nullable();
            $table->decimal('zscore_wfa', 5, 2)->nullable();
            $table->decimal('zscore_hfa', 5, 2)->nullable();
            $table->decimal('zscore_wfh', 5, 2)->nullable();
            $table->string('nutritional_status', 50)->nullable();
            $table->boolean('is_posyandu_day')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('child_id')
                ->references('id')
                ->on('children')
                ->onDelete('cascade');
        });

        // Immunization Schedules (for posyandu events)
        Schema::create('immunization_schedules', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('child_id')->nullable();
            $table->unsignedBigInteger('posyandu_id')->nullable();
            $table->string('title', 150);
            $table->enum('type', ['imunisasi', 'vitamin', 'posyandu'])->default('imunisasi');
            $table->datetime('scheduled_for');
            $table->string('location', 200)->nullable();
            $table->datetime('completed_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('child_id')
                ->references('id')
                ->on('children')
                ->onDelete('cascade');

            $table->foreign('posyandu_id')
                ->references('id')
                ->on('posyandus')
                ->onDelete('cascade');

            $table->index(['posyandu_id', 'type', 'scheduled_for']);
        });

        // Vitamin Distributions
        Schema::create('vitamin_distributions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('child_id')->constrained('children')->onDelete('cascade');
            $table->foreignId('posyandu_id')->constrained('posyandus')->onDelete('cascade');
            $table->enum('vitamin_type', ['vitamin_a_blue', 'vitamin_a_red', 'other'])->default('vitamin_a_blue');
            $table->date('distribution_date');
            $table->string('dosage', 50)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('child_id');
            $table->index('posyandu_id');
            $table->index('distribution_date');
        });

        // Immunization Records (actual immunization given)
        Schema::create('immunization_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('child_id')->constrained('children')->onDelete('cascade');
            $table->foreignId('posyandu_id')->constrained('posyandus')->onDelete('cascade');
            $table->enum('vaccine_type', [
                'bcg',
                'hepatitis_b_0',
                'hepatitis_b_1',
                'hepatitis_b_2',
                'hepatitis_b_3',
                'polio_0',
                'polio_1',
                'polio_2',
                'polio_3',
                'polio_4',
                'dpt_hib_hep_b_1',
                'dpt_hib_hep_b_2',
                'dpt_hib_hep_b_3',
                'ipv_1',
                'ipv_2',
                'campak_rubella_1',
                'campak_rubella_2',
                'other'
            ]);
            $table->date('immunization_date');
            $table->string('batch_number', 100)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('child_id');
            $table->index('posyandu_id');
            $table->index('immunization_date');
            $table->index('vaccine_type');
        });

        // PMT Logs
        Schema::create('pmt_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('child_id');
            $table->date('date');
            $table->enum('status', ['consumed', 'partial', 'refused']);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('child_id')
                ->references('id')
                ->on('children')
                ->onDelete('cascade');

            $table->unique(['child_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pmt_logs');
        Schema::dropIfExists('immunization_records');
        Schema::dropIfExists('vitamin_distributions');
        Schema::dropIfExists('immunization_schedules');
        Schema::dropIfExists('weighing_logs');
    }
};
