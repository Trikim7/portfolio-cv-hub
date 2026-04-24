const fs = require('fs');
const execSync = require('child_process').execSync;

const output = execSync('Get-ChildItem -Recurse -Path "src" -Include "*.tsx","*.ts" | Select-Object -ExpandProperty FullName', { shell: 'powershell.exe', encoding: 'utf8' });
const files = output.split('\n').map(s => s.trim()).filter(Boolean);

const nonAsciiRegex = /[^\x00-\x7F]/;
const ignoreFiles = ['locales', 'useI18nText', 'data'];

const results = [];
for (const file of files) {
  if (ignoreFiles.some(ign => file.includes(ign))) continue;
  
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Exclude comments
    if (line.trim().startsWith('//')) continue;
    if (nonAsciiRegex.test(line)) {
      results.push(file);
      break;
    }
  }
}

console.log('Files with non-ASCII text:');
results.forEach(f => console.log(f));
