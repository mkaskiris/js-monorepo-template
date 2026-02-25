// Stub environment variables required by module-level initializers so tests
// that don't hit the database can still import app modules without crashing.
// Real integration tests should override these before running queries.
if (!process.env['DATABASE_URL']) {
  process.env['DATABASE_URL'] = 'postgresql://localhost/test_stub'
}
if (!process.env['JWT_SECRET']) {
  process.env['JWT_SECRET'] = 'test-secret-do-not-use-in-production'
}
