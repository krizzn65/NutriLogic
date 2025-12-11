<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password - NutriLogic</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 24px; text-align: center; background: linear-gradient(135deg, #00BFEF 0%, #006AA6 100%); border-radius: 16px 16px 0 0;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                                🔐 Reset Password
                            </h1>
                            <p style="margin: 8px 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.9);">
                                NutriLogic - Monitoring Gizi Anak
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 16px; font-size: 16px; color: #374151; line-height: 1.6;">
                                Halo <strong>{{ $user->name }}</strong>,
                            </p>
                            <p style="margin: 0 0 24px; font-size: 16px; color: #6b7280; line-height: 1.6;">
                                Kami menerima permintaan untuk mereset password akun NutriLogic Anda. Gunakan kode berikut untuk melanjutkan:
                            </p>
                            
                            <!-- Code Box -->
                            <div style="text-align: center; margin: 32px 0;">
                                <div style="display: inline-block; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px dashed #00BFEF; border-radius: 12px; padding: 24px 48px;">
                                    <p style="margin: 0 0 8px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">
                                        Kode Reset Password
                                    </p>
                                    <p style="margin: 0; font-size: 36px; font-weight: 700; color: #006AA6; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                        {{ $token }}
                                    </p>
                                </div>
                            </div>
                            
                            <!-- Warning -->
                            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 24px 0;">
                                <p style="margin: 0; font-size: 14px; color: #92400e; line-height: 1.5;">
                                    ⚠️ <strong>Penting:</strong> Kode ini hanya berlaku selama <strong>1 jam</strong>. Jangan bagikan kode ini kepada siapapun.
                                </p>
                            </div>
                            
                            <p style="margin: 24px 0 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
                                Jika Anda tidak meminta reset password, abaikan email ini. Akun Anda tetap aman.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 40px; background-color: #f9fafb; border-radius: 0 0 16px 16px; text-align: center;">
                            <p style="margin: 0 0 8px; font-size: 14px; color: #9ca3af;">
                                Email ini dikirim secara otomatis oleh sistem NutriLogic
                            </p>
                            <p style="margin: 0; font-size: 12px; color: #d1d5db;">
                                © {{ date('Y') }} NutriLogic. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
