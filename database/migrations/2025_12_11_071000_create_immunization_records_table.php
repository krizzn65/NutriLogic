<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
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
            
            // Indexes
            $table->index('child_id');
            $table->index('posyandu_id');
            $table->index('immunization_date');
            $table->index('vaccine_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('immunization_records');
    }
};
