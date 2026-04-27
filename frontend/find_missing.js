const fs = require('fs');
const { execSync } = require('child_process');

const vi = JSON.parse(fs.readFileSync('src/locales/vi.json', 'utf8'));

const psScript = `Get-ChildItem -Recurse -Path "src" -Include "*.tsx","*.ts" | Select-String -Pattern "t\\(\\s*['\`"]([a-zA-Z0-9_.]+)[\\'\`"]" -AllMatches | Select-Object -ExpandProperty Matches | Select-Object -ExpandProperty Groups | Where-Object { $_.Name -eq "1" } | Select-Object -ExpandProperty Value`;

try {
  const output = execSync(psScript, { shell: 'powershell.exe', encoding: 'utf8' });
  const keys = output.split('\n').map(s => s.trim()).filter(Boolean);
  const missing = new Set();

  keys.forEach(k => {
    const parts = k.split('.');
    let current = vi;
    let found = true;
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        found = false;
        break;
      }
    }
    if (!found) missing.add(k);
  });

  console.log('Missing keys:');
  Array.from(missing).sort().forEach(k => console.log(k));
} catch (e) {
  console.error(e);
}
