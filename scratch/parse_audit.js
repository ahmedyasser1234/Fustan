
import fs from 'fs';

function parseAudit(filePath, label) {
  if (!fs.existsSync(filePath)) {
    console.log(`File ${filePath} not found`);
    return;
  }
  try {
    let rawData = fs.readFileSync(filePath, 'utf8');
    if (rawData.charCodeAt(0) === 0xFEFF) {
      rawData = rawData.slice(1);
    }
    const data = JSON.parse(rawData);
    const advisories = data.advisories || {};
    const highAndCritical = [];

    Object.values(advisories).forEach(advisory => {
      if (advisory.severity === 'high' || advisory.severity === 'critical') {
        highAndCritical.push({
          severity: advisory.severity,
          package: advisory.module_name,
          title: advisory.title,
          vulnerable_versions: advisory.vulnerable_versions,
          patched_versions: advisory.patched_versions,
          url: advisory.url
        });
      }
    });

    console.log(`\n--- ${label} ---`);
    if (highAndCritical.length === 0) {
      console.log('No HIGH or CRITICAL vulnerabilities found.');
    } else {
      highAndCritical.forEach(v => {
        console.log(`[${v.severity.toUpperCase()}] ${v.package}: ${v.title} (${v.vulnerable_versions} -> ${v.patched_versions})`);
        console.log(`   Link: ${v.url}`);
      });
    }
  } catch (e) {
    console.log(`Error parsing ${filePath}: ${e.message}`);
  }
}

parseAudit('g:/koko/Fustan-main/audit_root_utf8.json', 'Root Project');
parseAudit('g:/koko/Fustan-main/server-nestjs/audit_server_utf8.json', 'Server (NestJS)');
