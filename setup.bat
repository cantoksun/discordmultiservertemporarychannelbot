@echo off
chcp 65001 >nul
echo   raffie discord bot kurulum sihirbazı

echo [1/4] gerekli paketler yükleniyor (npm install)...
call npm install
if %errorlevel% neq 0 (
    echo [hata] npm install başarısız oldu. lütfen node.js yüklü olduğundan emin olun.
    pause
    exit /b %errorlevel%
)

echo.
echo [2/4] veritabanı şeması ve client güncelleniyor...
cd packages/shared

REM root .env dosyasını buraya kopyalıyoruz ki prisma bulabilsin
if exist "..\..\.env" (
    echo [.env] kopyalanıyor...
    copy /Y "..\..\.env" ".env" >nul
) else (
    echo [uyarı] ana dizinde .env dosyası bulunamadı! lütfen .env.example dosyasını .env yapıp doldurun.
    pause
    exit /b 1
)

call npx prisma generate
if %errorlevel% neq 0 (
    echo [hata] prisma generate başarısız oldu.
    pause
    exit /b %errorlevel%
)

echo.
echo [bilgi] shared paket derleniyor (build)...
call npm run build
if %errorlevel% neq 0 (
    echo [hata] shared paket derlenemedi.
    pause
    exit /b %errorlevel%
)

call npx prisma db push --accept-data-loss
if %errorlevel% neq 0 (
    echo [hata] veritabanı bağlantısı kurulamadı. lütfen .env dosyasındaki database_url'i kontrol edin.
    pause
    exit /b %errorlevel%
)

echo.
echo [info] registering commands (clearing old commands)...
call npm run register
if %errorlevel% neq 0 (
    echo [warning] command registration failed. you may need to run 'npm run register' manually.
)
cd ../..

echo.
echo [4/4] bot başlatılıyor...
cd apps/voice-bot
call npm run dev

pause

