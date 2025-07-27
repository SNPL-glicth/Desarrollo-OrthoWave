#!/bin/bash

# Token de autorización
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQG9ydG93aGF2ZS5jb20iLCJzdWIiOjEsInJvbCI6ImFkbWluIiwiaWF0IjoxNzUyODA1MzUwLCJleHAiOjE3NTI4OTE3NTB9.TCSob3FKjsPkjRFPbDAe6cBs4vgIbl99kOlnCiMmj-A"

# Base URL
BASE_URL="http://localhost:4000"

# IDs de usuarios a eliminar (todos excepto 1, 2, 3)
USER_IDS=(4 5 6 7 8 9 10 11 12)

echo "🧹 Eliminando usuarios extra..."

for id in "${USER_IDS[@]}"; do
    echo "Eliminando usuario ID: $id"
    response=$(curl -X DELETE "$BASE_URL/users/admin/$id" \
        -H "Authorization: Bearer $TOKEN" \
        -s)
    echo "   Respuesta: $response"
done

echo "✅ Limpieza completada. Verificando usuarios restantes..."

# Verificar usuarios restantes
curl -X GET "$BASE_URL/users/admin/todos" \
    -H "Authorization: Bearer $TOKEN" \
    -s | jq '.[] | {id, email, nombre, apellido, rol: .rol.nombre}'
