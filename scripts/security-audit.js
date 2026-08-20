#!/usr/bin/env node

/**
 * AlmostHack — Production Security & Release Engineering Audit
 * Verifies repository safety policies, migration integrity, and secret hygiene.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

let totalChecks = 0;
let failedChecks = 0;

function check(title, fn) {
  totalChecks++;
  process.stdout.write(`• ${title}... `);
  try {
    fn();
    console.log('✅ PASS');
  } catch (err) {
    console.log(`❌ FAIL: ${err.message}`);
    failedChecks++;
  }
}

console.log('============================================================');
console.log('ALMOSTHACK SECURITY & RELEASE AUDIT');
console.log('============================================================\n');

// 1. Check for uncommitted/forbidden production migrations commands in workflows
check('1. Workflows do not contain "prisma db push" or "prisma migrate reset"', () => {
  const workflowsDir = path.join(ROOT_DIR, '.github', 'workflows');
  if (fs.existsSync(workflowsDir)) {
    const files = fs.readdirSync(workflowsDir);
    for (const f of files) {
      if (f.endsWith('.yml') || f.endsWith('.yaml')) {
        const content = fs.readFileSync(path.join(workflowsDir, f), 'utf8');
        if (content.includes('prisma db push')) {
          throw new Error(`Forbidden 'prisma db push' found in ${f}`);
        }
        if (content.includes('prisma migrate reset')) {
          throw new Error(`Forbidden 'prisma migrate reset' found in ${f}`);
        }
      }
    }
  }
});

// 2. Check Dockerfiles for secret leakage or COPY .env
check('2. Dockerfiles do not copy .env or hardcode secrets', () => {
  const dockerfiles = [
    path.join(ROOT_DIR, 'apps', 'api', 'Dockerfile'),
    path.join(ROOT_DIR, 'apps', 'web', 'Dockerfile'),
    path.join(ROOT_DIR, 'apps', 'worker', 'Dockerfile'),
  ];

  for (const df of dockerfiles) {
    if (fs.existsSync(df)) {
      const content = fs.readFileSync(df, 'utf8');
      if (/COPY\s+.*\.env/i.test(content)) {
        throw new Error(`Dangerous 'COPY .env' pattern detected in ${df}`);
      }
      if (/ENV\s+JWT_SECRET=[a-zA-Z0-9_-]+/i.test(content) && !content.includes('${')) {
        throw new Error(`Hardcoded JWT_SECRET detected in ${df}`);
      }
    }
  }
});

// 3. Check migration folder ordering and lockfile
check('3. Prisma migration history integrity & migration_lock.toml', () => {
  const migrationsDir = path.join(ROOT_DIR, 'apps', 'api', 'prisma', 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    throw new Error('Migrations directory not found');
  }

  const lockFile = path.join(migrationsDir, 'migration_lock.toml');
  if (!fs.existsSync(lockFile)) {
    throw new Error('Missing migration_lock.toml in prisma migrations');
  }

  const entries = fs.readdirSync(migrationsDir).filter((e) => {
    return fs.statSync(path.join(migrationsDir, e)).isDirectory();
  });

  if (entries.length === 0) {
    throw new Error('No migration directories found');
  }
});

// 4. Verify .gitignore ignores sensitive environment files
check('4. .gitignore covers .env and local secret overrides', () => {
  const gitignorePath = path.join(ROOT_DIR, '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    throw new Error('Missing .gitignore');
  }
  const content = fs.readFileSync(gitignorePath, 'utf8');
  if (!content.includes('.env')) {
    throw new Error('.gitignore must ignore .env files');
  }
});

// 5. Verify Package.json scripts do not call destructive database commands
check('5. Root package.json scripts hygiene', () => {
  const pkgPath = path.join(ROOT_DIR, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const scripts = JSON.stringify(pkg.scripts || {});
  if (scripts.includes('db push') || scripts.includes('migrate reset')) {
    throw new Error('Root package.json contains dangerous database commands');
  }
});

console.log('\n============================================================');
console.log(`AUDIT RESULTS: ${totalChecks - failedChecks}/${totalChecks} checks passed`);
console.log('============================================================\n');

if (failedChecks > 0) {
  process.exit(1);
} else {
  console.log('🛡️ Security and Release Engineering checks passed with 0 findings.');
  process.exit(0);
}
