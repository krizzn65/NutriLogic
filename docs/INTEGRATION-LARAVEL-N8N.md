# Integrasi Laravel Backend dengan N8N Workflow

## Overview

Dokumentasi ini menjelaskan cara menghubungkan Laravel backend NutriLogic dengan N8N workflow untuk fitur **Nutri-Assist** yang menggunakan AI Google Gemini.

## Arsitektur Flow

```
React Frontend (NutriAssistPage.jsx)
    ↓ POST /api/parent/children/{id}/nutri-assist
Laravel Backend (ParentDashboardController)
    ↓ HTTP POST dengan payload + API key
N8N Workflow (kr6iRmK76s7iTMS2)
    ↓ Query MySQL + Build Prompt
Google Gemini API
    ↓ AI-Generated Recommendations
N8N Workflow
    ↓ Format Response JSON
Laravel Backend
    ↓ Cache + Return JSON
React Frontend
    ✓ Display Recommendations
```

---

## Step 1: Setup Environment Variables

### **File: `.env`**

Tambahkan/update konfigurasi berikut:

```bash
# N8N Workflow Integration
# ⚠️ PENTING: Ganti URL dengan Production URL dari N8N workflow Anda
N8N_WEBHOOK_URL=http://localhost:5678/webhook/kr6iRmK76s7iTMS2
N8N_API_KEY=sOYs30C0ZATBJpC9g6PTFzMPMO0PLIw3K0454UlomQCWPk15WyhXjOYprwgiLJ6q
N8N_TIMEOUT=60
N8N_ENABLED=true

# Google Gemini API (untuk N8N workflow)
GEMINI_API_KEY=AIzaSyAFtwgfMNq_nh0QbyJxqF9UDarVtLC6NcU
NUTRILOGIC_API_KEY=sOYs30C0ZATBJpC9g6PTFzMPMO0PLIw3K0454UlomQCWPk15WyhXjOYprwgiLJ6q
```

### **Cara Mendapatkan Webhook URL yang Benar:**

1. **Buka workflow di N8N dashboard**
2. **Klik node "Webhook"** (node pertama)
3. **Lihat Production URL** (setelah workflow di-activate)
   - Format: `http://localhost:5678/webhook/{WORKFLOW_ID}`
   - Contoh: `http://localhost:5678/webhook/kr6iRmK76s7iTMS2`
4. **Copy URL** dan paste ke `.env` sebagai `N8N_WEBHOOK_URL`

### **Penjelasan Config:**

| Variable | Deskripsi | Default |
|----------|-----------|---------|
| `N8N_WEBHOOK_URL` | Production URL dari N8N workflow | - |
| `N8N_API_KEY` | API key untuk autentikasi Laravel → N8N | - |
| `N8N_TIMEOUT` | Timeout HTTP request (detik) | 60 |
| `N8N_ENABLED` | Enable/disable N8N integration | false |
| `NUTRILOGIC_API_KEY` | API key yang sama untuk validasi di N8N | - |

⚠️ **PENTING:** 
- `N8N_API_KEY` di Laravel `.env` harus **SAMA** dengan `NUTRILOGIC_API_KEY` yang diset di N8N environment variables
- Jika tidak sama, akan dapat error `401 Unauthorized`

---

## Step 2: Verify Configuration

### **File: `config/services.php`**

Pastikan config sudah ada (sudah otomatis ditambahkan):

```php
'n8n' => [
    'webhook_url' => env('N8N_WEBHOOK_URL'),
    'api_key' => env('N8N_API_KEY'),
    'timeout' => env('N8N_TIMEOUT', 60),
    'enabled' => env('N8N_ENABLED', false),
],
```

### **Clear Config Cache:**

```bash
php artisan config:clear
php artisan cache:clear
```

---

## Step 3: Controller Logic (Sudah Ada)

### **File: `app/Http/Controllers/ParentDashboardController.php`**

Method `nutriAssist()` sudah implement logic berikut:

```php
public function nutriAssist(Request $request, int $id): JsonResponse
{
    // 1. Validate user is parent (ibu)
    // 2. Validate child belongs to user
    // 3. Validate ingredients input
    // 4. Check if N8N enabled
    //    - YES: Call getAINutriAssist()
    //    - NO: Call getFallbackNutriAssist()
    // 5. Cache response for 24 hours
    // 6. Return JSON
}
```

### **Flow Detail:**

#### **A. N8N Enabled (AI Mode):**

```php
private function getAINutriAssist(Child $child, array $validated): array
{
    // Build payload
    $payload = [
        'child_id' => $child->id,
        'ingredients' => $validated['ingredients'],
        'date' => $validated['date'] ?? now()->toDateString(),
        'notes' => $validated['notes'] ?? null,
        'api_key' => config('services.n8n.api_key'),
    ];

    // Send HTTP POST to N8N webhook
    $response = Http::timeout($timeout)->post($webhookUrl, $payload);

    // Validate response
    if (!$response['success']) {
        throw new Exception('n8n failed');
    }

    return $response->json()['data'];
}
```

**Expected Payload ke N8N:**
```json
{
  "child_id": 1,
  "ingredients": ["beras", "ayam", "wortel", "bayam"],
  "api_key": "sOYs30C0ZATBJpC9g6PTFzMPMO0PLIw3K0454UlomQCWPk15WyhXjOYprwgiLJ6q",
  "date": "2025-11-30",
  "notes": "Anak sedang batuk"
}
```

**Expected Response dari N8N:**
```json
{
  "success": true,
  "data": {
    "child": {
      "id": 1,
      "full_name": "Ahmad Rizki",
      "age_in_months": 8
    },
    "recommendations": [
      {
        "name": "Bubur Ayam Sayur",
        "description": "...",
        "ingredients": ["beras", "ayam", "wortel"],
        "instructions": "...",
        "nutrition": {
          "calories": 180,
          "protein": 8,
          "carbs": 25,
          "fat": 5
        },
        "portion": "150ml",
        "meal_type": "makan_siang",
        "age_appropriate": true,
        "notes": "..."
      }
    ],
    "advice": {
      "general": "...",
      "nutritional_focus": "..."
    },
    "metadata": {
      "ingredients_provided": 4,
      "recommendations_count": 3,
      "generated_at": "2025-11-30T10:30:00.000Z",
      "ai_powered": true,
      "ai_provider": "google-gemini",
      "model": "gemini-1.5-flash",
      "cost": 0
    }
  }
}
```

#### **B. N8N Disabled (Fallback Mode):**

```php
private function getFallbackNutriAssist(Child $child, array $ingredients, int $ageInMonths): JsonResponse
{
    // Use NutritionService (basic menu matching)
    $recommendations = $this->nutritionService->getRecommendations(
        $child->id,
        $ingredients,
        $ageInMonths
    );

    return response()->json([
        'success' => true,
        'data' => [
            'child' => [...],
            'recommendations' => $recommendations,
            'metadata' => [
                'ai_powered' => false,
                'fallback' => true,
            ],
        ],
    ]);
}
```

---

## Step 4: Testing Integration

### **A. Test dengan Postman/cURL:**

```bash
curl -X POST http://localhost:8000/api/parent/children/1/nutri-assist \
  -H "Authorization: Bearer YOUR_SANCTUM_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ingredients": ["beras", "ayam", "wortel", "bayam", "tempe"],
    "notes": "Anak sedang batuk, hindari makanan dingin"
  }'
```

### **B. Test dari React Frontend:**

Frontend sudah implement di `NutriAssistPage.jsx`:

```javascript
const response = await api.post(`/parent/children/${selectedChildId}/nutri-assist`, {
    ingredients: ingredientsArray,
    date: date || undefined,
    notes: notes.trim() || undefined
});

setRecommendations(response.data.data);
```

### **C. Monitor Logs:**

**Laravel Logs:**
```bash
tail -f storage/logs/laravel.log
```

**N8N Execution Logs:**
- Buka N8N Dashboard
- Klik "Executions" di sidebar
- Lihat execution history workflow
- Klik execution untuk detail

---

## Step 5: Troubleshooting

### **Problem 1: Error "n8n webhook URL not configured"**

**Solusi:**
```bash
# Verify .env
cat .env | grep N8N

# Clear cache
php artisan config:clear
php artisan cache:clear

# Restart server
composer run dev
```

### **Problem 2: Error "401 Unauthorized" dari N8N**

**Cause:** API key tidak match

**Solusi:**
1. Check `.env` Laravel: `N8N_API_KEY=...`
2. Check N8N Environment Variables: `NUTRILOGIC_API_KEY=...`
3. Pastikan **SAMA PERSIS**

### **Problem 3: Timeout Error**

**Cause:** Gemini API lambat atau N8N workflow error

**Solusi:**
1. Tingkatkan timeout di `.env`:
   ```bash
   N8N_TIMEOUT=120
   ```
2. Check N8N execution logs untuk error
3. Test Gemini API langsung di N8N

### **Problem 4: Workflow Tidak Jalan**

**Checklist:**
- ✅ N8N workflow sudah **Active** (toggle ON)
- ✅ Webhook URL di `.env` menggunakan **Production URL**
- ✅ Database credentials di N8N benar
- ✅ Gemini API key valid
- ✅ `N8N_ENABLED=true` di `.env`

### **Problem 5: Response Structure Salah**

**Check:**
1. N8N workflow node "Format Final Response"
2. Pastikan structure match dengan yang diharapkan Laravel
3. Test di N8N dengan "Listen for Test Event"

---

## Step 6: Monitoring & Optimization

### **A. Caching Strategy**

Laravel cache response selama **24 jam**:

```php
$cacheKey = 'nutriassist_' . $child->id . '_' . md5(json_encode($ingredients));

$recommendations = Cache::remember($cacheKey, 86400, function () {
    return $this->getAINutriAssist($child, $validated);
});
```

**Clear specific cache:**
```php
Cache::forget('nutriassist_1_...');
```

**Clear all nutri-assist cache:**
```php
Cache::tags(['nutriassist'])->flush();
```

### **B. Error Logging**

Laravel otomatis log error:

```php
Log::error('NutriAssist AI Error: ' . $e->getMessage(), [
    'child_id' => $child->id,
    'ingredients' => $validated['ingredients'],
    'error' => $e->getMessage(),
]);
```

**View logs:**
```bash
tail -f storage/logs/laravel.log | grep NutriAssist
```

### **C. Performance Metrics**

**Add logging untuk monitor:**

```php
$startTime = microtime(true);

$recommendations = $this->getAINutriAssist($child, $validated);

$duration = microtime(true) - $startTime;
Log::info("NutriAssist AI completed", [
    'child_id' => $child->id,
    'duration_seconds' => round($duration, 2),
    'recommendations_count' => count($recommendations['recommendations']),
]);
```

---

## Step 7: Production Checklist

Sebelum deploy ke production:

### **Security:**
- [ ] `N8N_API_KEY` menggunakan random string 64 karakter
- [ ] `NUTRILOGIC_API_KEY` sama dengan N8N environment variable
- [ ] Gemini API key tidak ter-commit ke Git
- [ ] `.env` file di-ignore di `.gitignore`

### **Performance:**
- [ ] Cache enabled (24 jam)
- [ ] Timeout setting appropriate (60-120 detik)
- [ ] Database indexes untuk query N8N

### **Reliability:**
- [ ] Fallback mechanism tested
- [ ] Error logging active
- [ ] N8N workflow di-backup (export JSON)

### **Monitoring:**
- [ ] Laravel logs monitored
- [ ] N8N execution history reviewed
- [ ] Gemini API quota monitored

---

## Expected User Experience

### **Flow dari Perspektif User:**

1. **User membuka halaman Nutri-Assist**
   - Component: `NutriAssistPage.jsx`
   - Load list anak dari cache/API

2. **User mengisi form:**
   - Pilih anak
   - Input bahan makanan (comma/newline separated)
   - (Opsional) Tanggal
   - (Opsional) Catatan khusus

3. **User klik "Dapatkan Rekomendasi Terbaik"**
   - Submit button disabled
   - Loading spinner muncul
   - Text: "Memproses Rekomendasi..."

4. **Backend Processing (~5-15 detik):**
   - Laravel validate input
   - Call N8N webhook
   - N8N query database (child + health data)
   - N8N build AI prompt
   - N8N call Gemini API
   - Gemini generate recommendations
   - N8N parse response
   - N8N format JSON
   - Laravel receive response
   - Laravel cache result
   - Laravel return to frontend

5. **Frontend Display:**
   - Smooth scroll ke section recommendations
   - Animate recommendations card (fade in + slide)
   - Display:
     - Rekomendasi terbaik (badge ⭐)
     - Match percentage (colored badge)
     - Menu name + description
     - Nutrition info (kalori, protein)
     - Matched ingredients (green tags)

### **Timing Expectations:**

| Step | Duration | Note |
|------|----------|------|
| Form Submit → Laravel | ~100ms | Network latency |
| Laravel → N8N | ~200ms | HTTP request |
| N8N DB Queries | ~500ms | MySQL queries |
| N8N → Gemini API | **5-10s** | AI processing (slowest) |
| N8N Response → Laravel | ~100ms | Format JSON |
| Laravel → Frontend | ~100ms | Network latency |
| **TOTAL** | **~6-12s** | Normal range |

**Optimizations:**
- ✅ Cache hit: **~50ms** (instant!)
- ✅ Fallback mode: **~1-2s** (no AI call)

---

## Support & References

### **Dokumentasi Terkait:**
- [N8N Workflow Setup](./N8N-NUTRI-ASSIST-WORKFLOW.md)
- [Frontend Component](../resources/js/components/konten/NutriAssistPage.jsx)
- [Controller Logic](../app/Http/Controllers/ParentDashboardController.php)

### **External Links:**
- **Google Gemini API**: https://ai.google.dev/docs
- **N8N Documentation**: https://docs.n8n.io/
- **Laravel HTTP Client**: https://laravel.com/docs/http-client

### **Troubleshooting Contacts:**
- N8N Workflow Issues → Check execution logs
- Gemini API Issues → Check quota & API key
- Laravel Backend Issues → Check `storage/logs/laravel.log`

---

**Status**: ✅ Integration Ready

**Last Updated**: November 30, 2025

**Version**: 1.0.0
