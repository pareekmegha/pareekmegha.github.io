// Builds the site and publishes the dist/ folder to the gh-pages branch, which GitHub Pages serves.
// Run with: npm run deploy
import { execFileSync } from 'node:child_process';
import { rmSync, writeFileSync } from 'node:fs';

const run = (cmd, args, cwd = '.') => execFileSync(cmd, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' });
const read = (args) => execFileSync('git', args, { encoding: 'utf8' }).trim();

const remote = read(['remote', 'get-url', 'origin']);
// Publish under the same author as the latest source commit, so no other identity leaks into the public branch.
const name = read(['log', '-1', '--format=%an']);
const email = read(['log', '-1', '--format=%ae']);

run('npx', ['astro', 'build']);
// Without this file GitHub Pages ignores folders that start with an underscore, such as _astro.
writeFileSync('dist/.nojekyll', '');

rmSync('dist/.git', { recursive: true, force: true });
run('git', ['init', '-q', '-b', 'gh-pages'], 'dist');
run('git', ['add', '-A'], 'dist');
run('git', ['-c', `user.name="${name}"`, '-c', `user.email=${email}`, 'commit', '-q', '-m', '"Publish site"'], 'dist');
run('git', ['push', '-f', remote, 'gh-pages'], 'dist');
rmSync('dist/.git', { recursive: true, force: true });
console.log('Published. Changes appear on the live site within a minute or two.');
