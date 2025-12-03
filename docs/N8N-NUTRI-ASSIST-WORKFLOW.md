# N8N Workflow Setup - Nutri-Assist dengan Gemini AI

## Overview
Dokumentasi ini menjelaskan cara membuat workflow N8N untuk fitur **Nutri-Assist** yang menggunakan **Google Gemini API** untuk memberikan rekomendasi menu makanan MPASI berdasarkan bahan yang tersedia dan kondisi anak.

## Arsitektur Flow
```
Laravel Backend → N8N Webhook → Query Database → Build AI Prompt → 
Gemini API → Parse Response → Return Recommendations
```

## Prerequisites
1. **N8N** sudah terinstall dan berjalan
2. **Google Gemini API Key** (gratis dari Google AI Studio: https://makersuite.google.com/app/apikey)
3. **Database MySQL** yang sama dengan Laravel (untuk query data anak)
4. **API Key** untuk autentikasi antara Laravel dan N8N

---

## Node-Node yang Dibutuhkan

### 1. **Webhook Trigger Node**
- **Type**: `Webhook`
- **Method**: `POST`
- **Path**: `/webhook/nutriassist/recommend`
- **Response Mode**: `Last Node`
- **Expected Input**:
```json
{
  "child_id": 1,
  "ingredients": ["beras", "ayam", "wortel", "bayam"],
  "api_key": "your-secret-api-key",
  "date": "2025-11-30",
  "notes": "Anak sedang tidak nafsu makan"
}
```

---

### 2. **Validate API Key (IF Node)**
- **Type**: `IF`
- **Purpose**: Memvalidasi API key untuk keamanan
- **Condition**: 
  - `{{ $json.body.api_key }}` **equals** `YOUR_SECRET_KEY`
- **True**: Lanjut ke node berikutnya
- **False**: Return error "Unauthorized"

---

### 3. **Unauthorized Response (Function Node)**
- **Type**: `Function`
- **Connected from**: IF Node (false branch)
- **Code**:
```javascript
return {
  json: {
    success: false,
    message: "Unauthorized: Invalid API key",
    error: "INVALID_API_KEY"
  }
};
```

---

### 4. **Get Child Data (MySQL Node)**
- **Type**: `MySQL`
- **Operation**: `Execute Query`
- **Query**:
```sql
SELECT 
  c.id,
  c.full_name,
  c.gender,
  c.birth_date,
  c.nik,
  TIMESTAMPDIFF(MONTH, c.birth_date, CURDATE()) as age_in_months,
  TIMESTAMPDIFF(DAY, c.birth_date, CURDATE()) as age_in_days,
  c.birth_weight_kg,
  c.birth_height_cm,
  c.notes as child_notes,
  p.full_name as posyandu_name
FROM children c
LEFT JOIN posyandus p ON c.posyandu_id = p.id
WHERE c.id = {{ $json.body.child_id }}
LIMIT 1
```

**Important Notes:**
- ⚠️ Kolom asli di database adalah `birth_date`, bukan `date_of_birth`
- ✅ `age_in_months` dihitung dengan `TIMESTAMPDIFF()` karena bukan kolom database
- 📝 Ini adalah accessor di Laravel Model, bukan kolom fisik

---

### 5. **Get Latest Health Data (MySQL Node)**
- **Type**: `MySQL`
- **Operation**: `Execute Query`
- **Query**:
```sql
SELECT 
  wl.weight_kg,
  wl.height_cm,
  wl.muac_cm,
  wl.zscore_wfa,
  wl.zscore_hfa,
  wl.zscore_wfh,
  wl.nutritional_status,
  wl.measured_at,
  wl.notes as weighing_notes
FROM weighing_logs wl
WHERE wl.child_id = {{ $('Get Child Data').item.json.id }}
ORDER BY wl.measured_at DESC
LIMIT 1
```

**Important Notes:**
- ⚠️ Reference ke node "Get Child Data" untuk mendapatkan `child_id`
- ⚠️ JANGAN pakai `{{ $json.body.child_id }}` karena data sudah dari node sebelumnya
- ✅ Kolom database: `zscore_wfa` (bukan `z_score_wfa`), `measured_at` (bukan `weighing_date`)

---

### 6. **Get Recent Meal Logs (MySQL Node)** *(Optional)*
- **Type**: `MySQL`
- **Operation**: `Execute Query`
- **Query**:
```sql
SELECT 
    ml.id,
    ml.description,
    ml.ingredients,
    ml.time_of_day,
    ml.source,
    ml.eaten_at
FROM meal_logs ml
WHERE ml.child_id = {{ $('Get Child Data').item.json.id }}
ORDER BY ml.eaten_at DESC
LIMIT 7
```

**Important Notes:**
- ⚠️ Tabel `meal_logs` TIDAK punya kolom `notes` (hanya ada di `weighing_logs`)
- ✅ Kolom yang valid: `id`, `child_id`, `description`, `ingredients`, `time_of_day`, `source`, `eaten_at`
- 📝 Node ini optional - bisa di-skip jika tidak dibutuhkan riwayat makan

---

### 7. **Build AI Prompt (Function Node)**
- **Type**: `Function`
- **Purpose**: Menyiapkan prompt yang detail untuk Gemini
- **Code**:
```javascript
// Get data from previous nodes with safe references
const childData = $input.first().json;
const healthData = $input.all()[1]?.json || {};

// Get webhook data - adjust based on your webhook node name
const webhookData = $('Webhook').first().json.body || $('Webhook Trigger').first().json.body;
const ingredients = webhookData?.ingredients || [];
const notes = webhookData?.notes || '';

// Build comprehensive prompt
const prompt = `Kamu adalah ahli gizi anak Indonesia yang berpengalaman dalam MPASI (Makanan Pendamping ASI).

DATA ANAK:
- Nama: ${childData.full_name}
- Usia: ${childData.age_in_months} bulan
- Jenis Kelamin: ${childData.gender === 'L' ? 'Laki-laki' : 'Perempuan'}

DATA KESEHATAN TERAKHIR:
${healthData.weight_kg ? `- Berat Badan: ${healthData.weight_kg} kg` : ''}
${healthData.height_cm ? `- Tinggi Badan: ${healthData.height_cm} cm` : ''}
${healthData.muac_cm ? `- Lingkar Lengan: ${healthData.muac_cm} cm` : ''}
${healthData.nutritional_status ? `- Status Gizi: ${healthData.nutritional_status}` : ''}
${healthData.zscore_wfa ? `- Z-Score WFA: ${healthData.zscore_wfa}` : ''}
${healthData.zscore_hfa ? `- Z-Score HFA: ${healthData.zscore_hfa}` : ''}
${healthData.zscore_wfh ? `- Z-Score WFH: ${healthData.zscore_wfh}` : ''}

BAHAN MAKANAN TERSEDIA:
${ingredients.join(', ')}

${notes ? `CATATAN KHUSUS:\n${notes}\n` : ''}

TUGAS:
Berikan 3-5 rekomendasi menu MPASI yang:
1. Sesuai dengan usia anak (${childData.age_in_months} bulan)
2. Menggunakan bahan-bahan yang tersedia
3. Memperhatikan status gizi anak
4. Aman dan bergizi tinggi
5. Mudah dibuat oleh orang tua

FORMAT RESPONSE (JSON):
{
  "recommendations": [
    {
      "name": "Nama Menu",
      "description": "Deskripsi singkat menu",
      "ingredients": ["bahan1", "bahan2"],
      "instructions": "Cara membuat step-by-step",
      "nutrition": {
        "calories": 250,
        "protein": 10,
        "carbs": 30,
        "fat": 8
      },
      "portion": "150ml",
      "meal_type": "sarapan/makan_siang/makan_malam/snack",
      "age_appropriate": true,
      "notes": "Tips atau catatan khusus"
    }
  ],
  "general_advice": "Saran umum untuk orang tua",
  "nutritional_focus": "Area nutrisi yang perlu diperhatikan berdasarkan status gizi anak"
}

Berikan response dalam format JSON yang valid. Pastikan rekomendasi praktis dan sesuai dengan kondisi anak.`;

return {
  json: {
    prompt: prompt,
    child_id: childData.id,
    child_name: childData.full_name,
    age_in_months: childData.age_in_months,
    ingredients: ingredients
  }
};
```

---

### 8. **Call Gemini API (Google Gemini Chat Model Node)** ✨

**Type:** `Google Gemini Chat Model`

**Authentication:**
- **Credential:** `Google Gemini (PaLM) API account`
- **API Key:** Dapatkan dari https://makersuite.google.com/app/apikey (GRATIS)

**Settings:**

**Parameters:**
- **Resource:** `Text`
- **Operation:** `Message a Model`
- **Model:** `gemini-1.5-flash` (recommended - faster & cheaper)
  - Alternative: `gemini-1.5-pro` (more advanced)
- **Messages:**
  - **Prompt:** `={{ $json.prompt }}`
  - **Role:** `User`
- **Simplify Output:** `Enabled` ✅
- **Output Content as JSON:** `Disabled` ❌ (kita parse manual)

**Options (Click "Add Option"):**
| Parameter | Value | Description |
|-----------|-------|-------------|
| Temperature | `0.7` | Kreativitas response (0-1) |
| Maximum Tokens | `2048` | Max panjang response |
| Top P | `0.8` | Nucleus sampling |
| Top K | `40` | Top-k sampling |

**Why Gemini Native Node?**
- ✅ Lebih simple - tidak perlu setup manual URL, headers, body
- ✅ Auto error handling oleh N8N
- ✅ Credential management yang aman
- ✅ Built-in retry mechanism
- ✅ Better logging untuk debugging

**Credential Setup:**
1. Buka https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy API key
4. Di N8N: Credentials → Add → Google Gemini (PaLM) → Paste API key

---

### 9. **Parse Gemini Response (Function Node)**
- **Type**: `Function`
- **Purpose**: Extract dan parse JSON response dari Gemini native node
- **Code**:
```javascript
// Get Gemini response from native node
const geminiResponse = $input.first().json;
const promptData = $('Build AI Prompt').first().json;

try {
  // Native Gemini node returns simplified text response
  let responseText = geminiResponse.message?.content || geminiResponse.text || '';
  
  // Remove markdown code blocks if present
  let jsonText = responseText.trim();
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/```\n?/g, '');
  }
  
  // Parse JSON
  const aiRecommendations = JSON.parse(jsonText);
  
  // Validate structure
  if (!aiRecommendations.recommendations || !Array.isArray(aiRecommendations.recommendations)) {
    throw new Error('Invalid response structure: missing recommendations array');
  }
  
  // Return with CONSISTENT structure
  return {
    json: {
      success: true,
      ai_recommendations: aiRecommendations,  // ✅ Nested here
      child_id: promptData.child_id,
      child_name: promptData.child_name,
      age_in_months: promptData.age_in_months
    }
  };
} catch (error) {
  // Fallback with EMPTY structure
  console.error('Parse error:', error);
  return {
    json: {
      success: false,
      error: "Failed to parse AI response",
      error_details: error.message,
      ai_recommendations: {
        recommendations: [],  // ✅ Empty array fallback
        general_advice: '',
        nutritional_focus: ''
      },
      raw_response: geminiResponse
    }
  };
}
```

**Important Changes:**
- ✅ Support untuk output native Gemini node (`message.content` atau `text`)
- ✅ Validate response structure sebelum return
- ✅ Consistent nested structure di `ai_recommendations`
- ✅ Fallback dengan empty array jika parsing gagal

---

### 10. **Format Final Response (Function Node)**
- **Type**: `Function`
- **Purpose**: Format response untuk Laravel dengan defensive checks
- **Code**:
```javascript
// Get data from previous nodes using $input (more reliable)
const items = $input.all();
const childData = $('Get Child Data').first().json;
const parsedAI = $input.first().json; // Data dari Parse Gemini Response

// Try webhook with both possible names
let requestData = {};
try {
  requestData = $('Webhook').first().json.body || {};
} catch {
  try {
    requestData = $('Webhook Trigger').first().json.body || {};
  } catch {
    requestData = {};
  }
}

// Debug logging
console.log('=== DEBUG Format Final Response ===');
console.log('Parsed AI structure:', JSON.stringify(parsedAI, null, 2));
console.log('Child Data:', JSON.stringify(childData, null, 2));

// Defensive extraction - handle multiple possible structures
let recommendations = [];
let generalAdvice = '';
let nutritionalFocus = '';

// Check if parsedAI has ai_recommendations nested
if (parsedAI && parsedAI.ai_recommendations) {
  const ai = parsedAI.ai_recommendations;
  recommendations = ai.recommendations || [];
  generalAdvice = ai.general_advice || '';
  nutritionalFocus = ai.nutritional_focus || '';
} else if (parsedAI && parsedAI.recommendations) {
  // Direct structure (fallback)
  recommendations = parsedAI.recommendations || [];
  generalAdvice = parsedAI.general_advice || '';
  nutritionalFocus = parsedAI.nutritional_focus || '';
} else {
  console.warn('WARNING: No valid AI recommendations structure found');
}

console.log('Extracted recommendations count:', recommendations.length);
console.log('General advice:', generalAdvice);

// Validate we have valid data
if (!childData || !childData.id) {
  throw new Error('Missing child data from Get Child Data node');
}

// Build final response
const finalResponse = {
  success: true,
  data: {
    child: {
      id: childData.id,
      full_name: childData.full_name,
      age_in_months: childData.age_in_months
    },
    recommendations: recommendations,
    advice: {
      general: generalAdvice,
      nutritional_focus: nutritionalFocus
    },
    metadata: {
      ingredients_provided: (requestData?.ingredients || []).length,
      recommendations_count: recommendations.length,
      generated_at: new Date().toISOString(),
      ai_powered: parsedAI?.success !== false,
      ai_provider: 'google-gemini',
      model: 'gemini-1.5-flash',
      cost: 0
    }
  }
};

console.log('Final response structure:', JSON.stringify(finalResponse, null, 2));

return { json: finalResponse };
```

**Error Handling:**
- ✅ Use `$input` untuk akses data previous node (lebih reliable)
- ✅ Multiple fallback patterns untuk struktur AI response
- ✅ Extensive console logging untuk debugging
- ✅ Safe property access dengan optional chaining
- ✅ Graceful degradation dengan default values
- ✅ Validate critical data sebelum build response
- ✅ Try-catch untuk webhook node reference

---

### 11. **Respond to Webhook Node**
- **Type**: `Respond to Webhook`
- **Response Code**: `200`
- **Response Body**: `{{ $json }}`

---

## Environment Variables di N8N

Tambahkan environment variables berikut di N8N:

```bash
# API Keys
NUTRILOGIC_API_KEY=your_secret_api_key_for_laravel

# Database Connection (MySQL Node)
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=nutrilogic
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
```

**Note:** 
- ✅ **Gemini API Key** sekarang disimpan di **Credential Manager** N8N (bukan environment variable)
- ✅ Setup credential: N8N Dashboard → Credentials → Add → Google Gemini (PaLM)
- 🔐 Lebih aman karena encrypted oleh N8N

---

## Cara Mendapatkan Webhook URL yang Benar

### **PENTING: Cek URL di N8N Workflow**

1. **Buka workflow** di N8N dashboard
2. **Klik node "Webhook"** (node pertama)
3. **Lihat Webhook URLs** yang muncul di panel kanan:
   - **Test URL** (untuk development): `http://localhost:5678/webhook-test/WORKFLOW_ID`
   - **Production URL** (setelah activate): `http://localhost:5678/webhook/WORKFLOW_ID`

4. **Copy URL** yang sesuai (Test atau Production)

### **Test vs Production URL:**

| Mode | URL Pattern | Kapan Digunakan |
|------|-------------|----------------|
| Test | `/webhook-test/{workflow_id}` | Development, manual testing di N8N UI |
| Production | `/webhook/{workflow_id}` | Production, dipanggil dari Laravel |

### **Cara Activate Workflow:**
1. Di N8N workflow, klik toggle **"Active"** di kanan atas
2. Toggle harus **ON** (hijau) untuk production
3. Production URL akan aktif setelah workflow di-activate

### **Untuk Laravel `.env`:**
```bash
# Gunakan Production URL setelah workflow active
N8N_WEBHOOK_URL=http://localhost:5678/webhook/{YOUR_WORKFLOW_ID}
```

---

## Testing Workflow

### **A. Test Manual di N8N (Recommended untuk Debug)**

1. Buka workflow di N8N
2. Klik node **"Webhook"**
3. Klik tombol **"Listen for Test Event"**
4. Kirim request ke **Test URL** (dari Postman/cURL)
5. Lihat execution flow real-time di N8N UI

### **B. Test dengan cURL (Linux/Mac):**
```bash
curl -X POST http://localhost:5678/webhook/nutriassist/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "child_id": 1,
    "ingredients": ["beras", "ayam", "wortel", "bayam", "tempe"],
    "api_key": "your-secret-api-key",
    "notes": "Anak sedang batuk, hindari makanan dingin"
  }'
```

### **C. Test dengan PowerShell (Windows - Recommended):**

```powershell
$body = @{
    child_id = 1
    ingredients = @("beras", "ayam", "wortel", "bayam", "tempe")
    api_key = "sOYs30C0ZATBJpC9g6PTFzMPMO0PLIw3K0454UlomQCWPk15WyhXjOYprwgiLJ6q"
    notes = "Anak sedang batuk, hindari makanan dingin"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5678/webhook-test/kr6iRmK76s7iTMS2" -Method POST -Body $body -ContentType "application/json"
```

### **D. Test dengan File JSON (Semua Platform):**

**1. Buat file `test-request.json`:**
```json
{
  "child_id": 1,
  "ingredients": ["beras", "ayam", "wortel", "bayam", "tempe"],
  "api_key": "sOYs30C0ZATBJpC9g6PTFzMPMO0PLIw3K0454UlomQCWPk15WyhXjOYprwgiLJ6q",
  "notes": "Anak sedang batuk, hindari makanan dingin"
}
```

**2. Jalankan cURL:**
```bash
curl -X POST http://localhost:5678/webhook-test/kr6iRmK76s7iTMS2 -H "Content-Type: application/json" -d @test-request.json
```

### **E. Test dengan Postman (Paling Mudah):**

1. **Method:** `POST`
2. **URL:** `http://localhost:5678/webhook-test/kr6iRmK76s7iTMS2` (ganti dengan URL Anda)
3. **Headers:**
   - `Content-Type`: `application/json`
4. **Body** (raw JSON):
```json
{
  "child_id": 1,
  "ingredients": ["beras", "ayam", "wortel", "bayam", "tempe"],
  "api_key": "sOYs30C0ZATBJpC9g6PTFzMPMO0PLIw3K0454UlomQCWPk15WyhXjOYprwgiLJ6q",
  "notes": "Anak sedang batuk, hindari makanan dingin"
}
```

---

### Expected Response:
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
        "description": "Bubur lembut dengan ayam cincang dan sayuran",
        "ingredients": ["beras", "ayam", "wortel", "bayam"],
        "instructions": "1. Masak beras hingga lembut...",
        "nutrition": {
          "calories": 180,
          "protein": 8,
          "carbs": 25,
          "fat": 5
        },
        "portion": "150ml",
        "meal_type": "makan_siang",
        "age_appropriate": true,
        "notes": "Pastikan tekstur sangat lembut untuk usia 8 bulan"
      }
    ],
    "advice": {
      "general": "Berikan makanan dalam porsi kecil tapi sering...",
      "nutritional_focus": "Fokus pada protein untuk pertumbuhan"
    },
    "metadata": {
      "ingredients_provided": 5,
      "recommendations_count": 1,
      "generated_at": "2025-11-30T10:30:00.000Z",
      "ai_powered": true,
      "ai_provider": "google-gemini",
      "model": "gemini-1.5-flash",
      "cost": 0
    }
  }
}
```

---

## N8N Variable Reference Cheat Sheet

Panduan lengkap cara mengakses data antar node di N8N:

### **1. Reference Data dari Webhook Node:**
```javascript
// Di node langsung setelah Webhook
{{ $json.body.field_name }}              // ✅ Direct access

// Dari node lain (reference by name)
{{ $('Webhook').item.json.body.field }}  // ✅ Explicit reference
{{ $('Webhook Trigger').first().json.body.field }}  // ✅ Alternative
```

### **2. Reference Data dari Node Sebelumnya:**
```javascript
{{ $input.item.json.field }}             // ✅ Previous node output
{{ $input.first().json.field }}          // ✅ First item
{{ $items()[0].json.field }}             // ✅ Array syntax
```

### **3. Reference Data dari Node Spesifik:**
```javascript
{{ $('Node Name').item.json.field }}     // ✅ By node name (single item)
{{ $('Node Name').first().json.field }}  // ✅ First item
{{ $('Node Name').all() }}               // ✅ All items (array)
{{ $node['Node Name'].json[0].field }}   // ✅ Alternative syntax
```

### **4. Multiple Items / Loop:**
```javascript
// Get all items as array
const allItems = $input.all().map(item => item.json);

// Get specific node's all items
const nodeItems = $('MySQL Query').all().map(item => item.json);
```

### **5. Contoh Real untuk Workflow Nutri-Assist:**

**Di Function Node "Build AI Prompt":**
```javascript
// ✅ BENAR - Reference node by name
const childData = $('Get Child Data').first().json;
const healthData = $('Get Latest Health Data').first().json;
const webhookData = $('Webhook').first().json.body;

// ❌ SALAH - body.child_id sudah tidak ada di node ini
const childData = $json.body.child_id; // Error!
```

**Di MySQL Query Node:**
```sql
-- ✅ BENAR - Reference previous node
WHERE child_id = {{ $('Get Child Data').item.json.id }}

-- ❌ SALAH - body sudah tidak accessible
WHERE child_id = {{ $json.body.child_id }}
```

### **6. Safe Access dengan Fallback:**
```javascript
// Optional chaining untuk avoid errors
const value = $('Node Name').first()?.json?.field || 'default';

// Ternary untuk conditional
const data = $input.item.json.field ? $input.item.json.field : [];
```

---

## Tips & Best Practices

### 1. **Error Handling**
- Selalu tambahkan error handling di setiap node
- Gunakan IF node untuk validasi data sebelum ke Gemini
- Berikan response yang informatif jika gagal

### 2. **Performance**
- Cache response di Laravel untuk mengurangi API calls
- Set timeout yang wajar (30-60 detik)
- Monitor usage Gemini API (ada limit gratis)

### 3. **Security**
- Jangan hardcode API key di workflow
- Gunakan environment variables
- Validasi semua input dari webhook
- Rate limiting di Laravel

### 4. **Prompt Engineering**
- Semakin detail prompt, semakin baik hasil
- Selalu minta response dalam format JSON
- Berikan contoh format yang diinginkan
- Sertakan context yang relevan (usia, status gizi, dll)

### 5. **Database Optimization**
- Gunakan index pada kolom yang sering di-query
- Limit hasil query untuk performa
- Pertimbangkan caching untuk data yang jarang berubah

---

## Troubleshooting

### Problem: Gemini API Error 400
- **Solution**: Periksa format JSON prompt, pastikan valid
- Periksa API key sudah benar
- Cek quota API Gemini belum habis

### Problem: Database Connection Failed
- **Solution**: Periksa credentials MySQL di N8N
- Pastikan MySQL accessible dari N8N server
- Cek firewall settings

### Problem: Workflow Timeout
- **Solution**: Tingkatkan timeout setting di N8N
- Optimasi query database
- Reduce max tokens di Gemini config

### Problem: Invalid JSON Response dari Gemini
- **Solution**: Update parsing logic di Function Node
- Tambahkan fallback mechanism
- Log raw response untuk debugging

---

## Next Steps

Setelah workflow N8N selesai di-setup:

1. **Konfigurasi Laravel**:
   - Tambahkan N8N webhook URL di `.env`
   - Tambahkan API key untuk autentikasi
   - Update `ParentDashboardController` untuk call webhook

2. **Testing End-to-End**:
   - Test dari React frontend
   - Validasi response sesuai ekspektasi
   - Test error cases

3. **Monitoring**:
   - Setup logging di N8N
   - Monitor Gemini API usage
   - Track response time

4. **Optimization**:
   - Implement caching strategy
   - Add retry mechanism
   - Optimize database queries

---

## Referensi

- **Google Gemini API**: https://ai.google.dev/docs
- **N8N Documentation**: https://docs.n8n.io/
- **N8N MySQL Node**: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.mysql/

---

**Catatan**: Workflow ini menggunakan Gemini API gratis yang memiliki limit. Untuk production, pertimbangkan upgrade ke tier berbayar atau implement fallback mechanism.
