#!/usr/bin/env node
/**
 * Lightweight endpoint verification for Lookbook API.
 * - Hits public and admin endpoints
 * - Verifies response shapes and key fields
 * - Sends a sample analytics track event
 *
 * Usage: node scripts/test_endpoints.mjs [--base http://localhost:3000]
 */

const BASE = (() => {
  const argIdx = process.argv.indexOf('--base')
  return argIdx !== -1 ? process.argv[argIdx + 1] : (process.env.LB_API_BASE || 'http://localhost:3000')
})()

const ADMIN_EMAIL = process.env.LB_ADMIN_EMAIL || 'admin@example.com'
const ADMIN_PASSWORD = process.env.LB_ADMIN_PASSWORD || 'Admin@123'

const results = []
const add = (name, ok, info) => results.push({ name, ok, info })
const assert = (cond, name, info) => add(name, !!cond, info)

async function http(path, { method = 'GET', headers = {}, body, token } = {}) {
  const url = path.startsWith('http') ? path : `${BASE}${path}`
  const h = { 'content-type': 'application/json', ...headers }
  if (token) h.authorization = `Bearer ${token}`
  const res = await fetch(url, { method, headers: h, body: body ? JSON.stringify(body) : undefined })
  const text = await res.text()
  let json
  try { json = text ? JSON.parse(text) : null } catch { json = { raw: text } }
  return { status: res.status, ok: res.ok, json }
}

async function login() {
  let { ok, json, status } = await http('/auth/login', {
    method: 'POST',
    body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD }
  })
  if (!(ok && json?.token)) {
    // fallback to legacy path if needed
    const res2 = await http('/admin/auth/login', {
      method: 'POST',
      body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD }
    })
    ok = res2.ok; json = res2.json; status = res2.status
  }
  assert(ok && json?.token, 'Auth | login', { status, json })
  return json?.token
}

function hasKeys(obj, keys) { return keys.every(k => k in obj) }

async function testPublicMoodboards(token) {
  const logError = (label, res) => {
    console.error(`❌ ${label} failed:`)
    console.error(`  ↳ URL: ${res.url}`)
    console.error(`  ↳ Status: ${res.status}`)
    console.error(`  ↳ ok: ${res.ok}`)
    console.error(`  ↳ Response JSON:`, JSON.stringify(res.json, null, 2))
  }

  const safeHttp = async (path) => {
    try {
      const res = await http(path)
      return res
    } catch (err) {
      console.error(`🚨 Network/HTTP error on ${path}:`, err)
      throw err
    }
  }

  // --- List ---
  {
    const res = await safeHttp('/moodboards')
    const { ok, json } = res
    if (!ok || !Array.isArray(json?.data)) logError('Public | moodboards list', res)
    assert(ok && Array.isArray(json?.data), 'Public | moodboards list', { count: json?.data?.length })
  }

  // --- Featured ---
  {
    const res = await safeHttp('/moodboards/featured')
    const { ok, json } = res
    if (!ok || !Array.isArray(json?.data)) logError('Public | moodboards featured', res)
    assert(ok && Array.isArray(json?.data), 'Public | moodboards featured', { count: json?.data?.length })
  }

  // --- By slug ---
  {
    const res = await safeHttp('/moodboards/slug/parisian-chic')
    const { ok, json } = res
    if (!ok || !json?.id) logError('Public | moodboard by slug', res)
    assert(ok && json?.id === 'mood_001', 'Public | moodboard by slug', { id: json?.id })

    const prod = json?.products?.[0] || {}
    if (!('purchaseType' in prod) || !('blurhash' in prod)) logError('Public | moodboard nested product normalized', res)
    assert('purchaseType' in prod && 'blurhash' in prod, 'Public | moodboard nested product normalized', { prod })
  }

  // --- By ID ---
  {
    const res = await safeHttp('/moodboards/mood_001')
    const { ok, json } = res
    if (!ok || json?.slug !== 'parisian-chic') logError('Public | moodboard by id', res)
    assert(ok && json?.slug === 'parisian-chic', 'Public | moodboard by id', { slug: json?.slug })
  }

  // --- Products for moodboard (no /related route in API) ---
  {
    const res = await safeHttp('/moodboards/mood_001/products')
    const { ok, json } = res
    if (!ok || !Array.isArray(json)) logError('Public | moodboard products', res)
    assert(ok && Array.isArray(json), 'Public | moodboard products', { count: json?.length })
  }
}


async function testPublicProducts(token) {
  const logError = (label, res) => {
    console.error(`❌ ${label} failed:`)
    console.error(`  ↳ Status: ${res.status}`)
    console.error(`  ↳ ok: ${res.ok}`)
    console.error(`  ↳ Response JSON:`, JSON.stringify(res.json, null, 2))
  }

  const safeHttp = async (path) => {
    try {
      const res = await http(path)
      return res
    } catch (err) {
      console.error(`🚨 Network/HTTP error on ${path}:`, err)
      throw err
    }
  }

  // --- List ---
  {
    const res = await safeHttp('/products')
    const { ok, json } = res
    if (!ok || !Array.isArray(json?.data)) logError('Public | products list', res)
    assert(ok && Array.isArray(json?.data), 'Public | products list', { count: json?.data?.length })
  }

  // --- Featured ---
  {
    const res = await safeHttp('/products/featured')
    const { ok, json } = res
    if (!ok || !Array.isArray(json?.data)) logError('Public | products featured', res)
    assert(ok && Array.isArray(json?.data), 'Public | products featured', { count: json?.data?.length })
  }

  // --- Brands ---
  {
    const res = await safeHttp('/products/brands')
    const { ok, json } = res
    if (!ok || !Array.isArray(json)) logError('Public | products brands', res)
    assert(ok && Array.isArray(json), 'Public | products brands', { count: json?.length })
  }

  // --- Categories ---
  {
    const res = await safeHttp('/products/categories')
    const { ok, json } = res
    if (!ok || !Array.isArray(json)) logError('Public | products categories', res)
    assert(ok && Array.isArray(json), 'Public | products categories', { count: json?.length })
  }

  // --- Tags ---
  {
    const res = await safeHttp('/products/tags')
    const { ok, json } = res
    if (!ok || !Array.isArray(json)) logError('Public | products tags', res)
    assert(ok && Array.isArray(json), 'Public | products tags', { count: json?.length })
  }

  // --- By slug ---
  {
    const res = await safeHttp('/products/slug/classic-trench-coat')
    const { ok, json } = res
    if (!ok || json?.id !== 'prod_001') logError('Public | product by slug', res)
    assert(ok && json?.id === 'prod_001', 'Public | product by slug', { id: json?.id })
  }

  // --- By ID ---
  {
    const res = await safeHttp('/products/prod_001')
    const { ok, json } = res
    if (!ok || json?.slug !== 'classic-trench-coat') logError('Public | product by id', res)
    assert(ok && json?.slug === 'classic-trench-coat', 'Public | product by id', { slug: json?.slug })
  }

  // --- Related ---
  {
    const res = await safeHttp('/products/prod_001/related')
    const { ok, json } = res
    if (!ok || !Array.isArray(json?.data)) logError('Public | product related', res)
    assert(ok && Array.isArray(json?.data), 'Public | product related', { count: json?.data?.length })
  }
}

async function testAnalytics(token) {
  if (!token) {
    add('Admin | analytics (skipped, no token)', true)
    return
  }
  // Overview
  {
    const { ok, json } = await http('/admin/analytics/overview', { token })
    assert(ok && typeof json?.totalVisitors === 'number', 'Admin | analytics overview', { totalVisitors: json?.totalVisitors })
  }
  // Users
  {
    const { ok, json } = await http('/admin/analytics/users', { token })
    assert(ok && 'newUsers' in json, 'Admin | analytics users', {})
  }
  // Aggregate products
  {
    const { ok, json } = await http('/admin/analytics/products', { token })
    assert(ok && Array.isArray(json?.topProducts), 'Admin | analytics products aggregate', {})
  }
  // Product by ID
  {
    const { ok, json } = await http('/admin/analytics/products/prod_001', { token })
    assert(ok && json?.productId === 'prod_001', 'Admin | analytics product by id', {})
  }
  // Moodboards
  {
    const { ok, json } = await http('/admin/analytics/moodboards', { token })
    assert(ok && json?.timeRange, 'Admin | analytics moodboards', {})
  }
  // Recent activity
  {
    const { ok, json } = await http('/admin/analytics/recent-activity', { token })
    assert(ok && Array.isArray(json?.events), 'Admin | analytics recent activity', {})
  }
  // Timeseries
  {
    const { ok, json } = await http('/api/analytics/timeseries?timeRange=7d', { token })
    assert(ok && Array.isArray(json?.data), 'Admin | analytics timeseries', {})
  }
  // Categories
  {
    const { ok, json } = await http('/api/analytics/categories?timeRange=7d', { token })
    assert(ok && Array.isArray(json?.data), 'Admin | analytics categories', {})
  }
  // Funnel
  {
    const { ok, json } = await http('/api/analytics/funnel?timeRange=7d', { token })
    assert(ok && Array.isArray(json), 'Admin | analytics funnel', {})
  }
  // Trends
  {
    const { ok, json } = await http('/api/analytics/trends?timeRange=7d', { token })
    assert(ok && Array.isArray(json), 'Admin | analytics trends', {})
  }
  // Track (public ingestion)
  {
    const ev = { userId: 'user_test', eventType: 'page_view', url: '/' }
    const { ok, json } = await http('/api/analytics/track', { method: 'POST', body: ev })
    assert(ok && json?.success, 'Public | analytics track', { inserted: json?.inserted })
  }
}

async function main() {
  console.log(`Testing against ${BASE}`)
  const token = await login()
  await testPublicProducts(token)
  await testPublicMoodboards(token)
  await testAnalytics(token)

  const passed = results.filter(r => r.ok).length
  const failed = results.length - passed
  for (const r of results) {
    const mark = r.ok ? 'PASS' : 'FAIL'
    console.log(`${mark} - ${r.name}${r.ok ? '' : ' ' + JSON.stringify(r.info || {})}`)
  }
  console.log(`\nSummary: ${passed} passed, ${failed} failed, ${results.length} total`)
  if (failed > 0) process.exit(1)
}

main().catch(err => { console.error('Test run error:', err); process.exit(1) })
