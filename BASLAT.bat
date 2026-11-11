@echo off
chcp 65001 > nul
title Hankan Emlak Pro - Portföy, Performans & CRM
cd /d "%~dp0"

echo ======================================================================
echo           HANKAN EMLAK PRO - PORTFÖY, PERFORMANS & CRM SİSTEMİ
echo ======================================================================
echo.
echo [1/2] Sunucu başlatılıyor...
start http://localhost:5000

echo [2/2] Mobil telefonlardan erişmek için aynı Wi-Fi ağında:
echo        http://192.168.1.7:5000
echo.
echo Program çalışıyor. Kapatmak için bu pencereyi kapatabilirsiniz.
echo ======================================================================
echo.

npm start
pause
