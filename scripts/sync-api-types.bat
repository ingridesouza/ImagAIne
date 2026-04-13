@echo off
REM =============================================================================
REM sync-api-types.bat — Sincroniza spec OpenAPI + tipos TypeScript (Windows)
REM Uso: scripts\sync-api-types.bat
REM =============================================================================

echo === ImagAIne SDD - Sync API Types ===

echo [1/3] Exportando schema do backend...
docker compose exec web python manage.py spectacular --file openapi-schema.yaml
if %ERRORLEVEL% NEQ 0 (
    echo ERRO: Falha ao exportar schema. O backend esta rodando?
    exit /b 1
)

docker compose exec web cat openapi-schema.yaml > frontend\openapi-schema.yaml
echo       Schema salvo em frontend\openapi-schema.yaml

echo [2/3] Gerando tipos TypeScript...
cd frontend
call npx openapi-typescript ./openapi-schema.yaml -o src/api/schema.d.ts
if %ERRORLEVEL% NEQ 0 (
    echo ERRO: Falha ao gerar tipos. Rode npm install primeiro.
    cd ..
    exit /b 1
)
cd ..
echo       Tipos gerados em frontend\src\api\schema.d.ts

echo [3/3] Pronto!
echo.
echo Arquivos atualizados:
echo   - frontend\openapi-schema.yaml  (OpenAPI spec)
echo   - frontend\src\api\schema.d.ts  (TypeScript types)
