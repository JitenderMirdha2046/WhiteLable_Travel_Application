#!/usr/bin/env bash
set -euo pipefail

# End-to-end test: Admin user management flow across all services
# Tests: frontend -> api-gateway -> user-service + trip-service -> postgres

GATEWAY="http://localhost:8090"
PASS=0
FAIL=0

green() { echo -e "\033[32m$1\033[0m"; }
red() { echo -e "\033[31m$1\033[0m"; }
pass() { PASS=$((PASS+1)); green "  ✓ $1"; }
fail() { FAIL=$((FAIL+1)); red "  ✗ $1"; }

# Wait for gateway to be ready
echo "Waiting for API gateway..."
for i in $(seq 1 30); do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8090/api/tenants/branding" 2>/dev/null || echo "000")
  if [ "$CODE" != "000" ]; then
    pass "API gateway is up (status=$CODE)"
    break
  fi
  if [ "$i" -eq 30 ]; then fail "API gateway did not start"; exit 1; fi
  sleep 1
done

echo ""
echo "=== Tenant Registration ==="
TENANT_EMAIL="agency-e2e-$(date +%s)@test.com"
TENANT_PASS="password123"
TENANT_NAME="E2E Test Agency"

REG_RESP=$(curl -sf -X POST "$GATEWAY/api/tenants/register" \
  -H 'Content-Type: application/json' \
  -d "{
    \"agencyName\": \"$TENANT_NAME\",
    \"adminEmail\": \"$TENANT_EMAIL\",
    \"adminPassword\": \"$TENANT_PASS\",
    \"subdomain\": \"e2e-$(date +%s)\"
  }") && pass "Tenant registered" || fail "Tenant registration failed"

ADMIN_TOKEN=$(echo "$REG_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])" 2>/dev/null || echo "")
TENANT_ID=$(echo "$REG_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['tenantId'])" 2>/dev/null || echo "")

if [ -z "$ADMIN_TOKEN" ] || [ -z "$TENANT_ID" ]; then
  echo "  Response: $REG_RESP"
  fail "Could not extract token/tenantId"
  echo ""
  echo "=== Results: $PASS passed, $FAIL failed ==="
  exit 1
fi
echo "  Tenant ID: $TENANT_ID"

echo ""
echo "=== Admin Login ==="
LOGIN_RESP=$(curl -sf -X POST "$GATEWAY/api/tenants/login" \
  -H 'Content-Type: application/json' \
  -d "{
    \"email\": \"$TENANT_EMAIL\",
    \"password\": \"$TENANT_PASS\"
  }") && pass "Admin login succeeded" || fail "Admin login failed"

ADMIN_TOKEN2=$(echo "$LOGIN_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])" 2>/dev/null || echo "")
TENANT_ID2=$(echo "$LOGIN_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['tenantId'])" 2>/dev/null || echo "")

if [ -z "$ADMIN_TOKEN2" ]; then
  echo "  Response: $LOGIN_RESP"
  fail "Could not extract admin token"
  echo ""
  echo "=== Results: $PASS passed, $FAIL failed ==="
  exit 1
fi
echo "  Tenant ID from login: $TENANT_ID2"

echo ""
echo "=== Register Users ==="
for i in 1 2 3; do
  USER_EMAIL="customer-e2e-$(date +%s)-$i@test.com"
  USER_RESP=$(curl -sf -X POST "$GATEWAY/api/auth/register" \
    -H 'Content-Type: application/json' \
    -H "X-Tenant-Id: $TENANT_ID" \
    -d "{
      \"name\": \"Customer $i\",
      \"email\": \"$USER_EMAIL\",
      \"password\": \"password123\"
    }") && pass "Registered user $i ($USER_EMAIL)" || fail "Failed to register user $i"
done

echo ""
echo "=== Admin: Get Tenant Users ==="
USERS_RESP=$(curl -sf "$GATEWAY/api/user/admin/users" \
  -H "Authorization: Bearer $ADMIN_TOKEN2") && pass "GET /api/user/admin/users returned users" || fail "GET failed"

echo "  Response: $USERS_RESP"
USER_COUNT=$(echo "$USERS_RESP" | python3 -c "import sys,json; data=json.load(sys.stdin); print(len(data))" 2>/dev/null || echo "0")
echo "  User count: $USER_COUNT"
if [ "$USER_COUNT" -ge 3 ]; then pass "  Expected >= 3 users"; else fail "  Expected >= 3 users, got $USER_COUNT"; fi

USER_ID=$(echo "$USERS_RESP" | python3 -c "import sys,json; data=json.load(sys.stdin); print(data[0]['id'])" 2>/dev/null || echo "")
echo "  First user ID: $USER_ID"

echo ""
echo "=== Admin: Delete User ==="
if [ -n "$USER_ID" ]; then
  DELETE_RESP=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$GATEWAY/api/user/admin/$USER_ID" \
    -H "Authorization: Bearer $ADMIN_TOKEN2")
  if [ "$DELETE_RESP" = "204" ]; then
    pass "DELETE /api/user/admin/$USER_ID returned 204"
  else
    fail "DELETE returned $DELETE_RESP (expected 204)"
    echo "  Full response: $(curl -s -X DELETE "$GATEWAY/api/user/admin/$USER_ID" -H "Authorization: Bearer $ADMIN_TOKEN2")"
  fi
fi

echo ""
echo "=== Verify User Deleted ==="
USERS_AFTER=$(curl -sf "$GATEWAY/api/user/admin/users" \
  -H "Authorization: Bearer $ADMIN_TOKEN2")
COUNT_AFTER=$(echo "$USERS_AFTER" | python3 -c "import sys,json; data=json.load(sys.stdin); print(len(data))" 2>/dev/null || echo "0")
echo "  Users remaining: $COUNT_AFTER"
if [ "$COUNT_AFTER" -eq "$((USER_COUNT - 1))" ]; then
  pass "User count decreased by 1 after deletion"
else
  fail "Expected $((USER_COUNT - 1)) users, got $COUNT_AFTER"
fi

echo ""
echo "=== Unauthorized Access Tests ==="

# No auth header
NO_AUTH=$(curl -s -o /dev/null -w "%{http_code}" "$GATEWAY/api/user/admin/users")
if [ "$NO_AUTH" = "401" ]; then pass "No auth returns 401"; else fail "No auth returned $NO_AUTH (expected 401)"; fi

# Wrong token (invalid JWT)
WRONG_AUTH=$(curl -s -o /dev/null -w "%{http_code}" "$GATEWAY/api/user/admin/users" \
  -H "Authorization: Bearer fake-token")
if [ "$WRONG_AUTH" = "401" ]; then pass "Invalid token returns 401"; else fail "Invalid token returned $WRONG_AUTH (expected 401)"; fi

# Delete without auth
NO_AUTH_DEL=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$GATEWAY/api/user/admin/$USER_ID")
if [ "$NO_AUTH_DEL" = "401" ]; then pass "Delete without auth returns 401"; else fail "Delete without auth returned $NO_AUTH_DEL (expected 401)"; fi

echo ""
echo "=== Cross-Tenant Isolation ==="

# Register a second tenant
TENANT2_EMAIL="agency2-e2e-$(date +%s)@test.com"
REG2=$(curl -sf -X POST "$GATEWAY/api/tenants/register" \
  -H 'Content-Type: application/json' \
  -d "{
    \"agencyName\": \"E2E Agency 2\",
    \"adminEmail\": \"$TENANT2_EMAIL\",
    \"adminPassword\": \"password123\",
    \"subdomain\": \"e2e2-$(date +%s)\"
  }") && pass "Tenant 2 registered" || fail "Tenant 2 registration failed"
TOKEN2=$(echo "$REG2" | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])" 2>/dev/null || echo "")

USERS_TENANT2=$(curl -sf "$GATEWAY/api/user/admin/users" \
  -H "Authorization: Bearer $TOKEN2")
COUNT2=$(echo "$USERS_TENANT2" | python3 -c "import sys,json; data=json.load(sys.stdin); print(len(data))" 2>/dev/null || echo "-1")
if [ "$COUNT2" = "0" ]; then pass "Tenant 2 sees 0 users (isolated)"; else fail "Tenant 2 saw $COUNT2 users (expected 0)"; fi

echo ""
echo "================================"
echo "Results: $PASS passed, $FAIL failed"
echo "================================"

if [ "$FAIL" -gt 0 ]; then exit 1; fi
