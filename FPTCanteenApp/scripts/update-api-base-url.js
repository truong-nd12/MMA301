// Script: update-api-base-url.js
// Tự động lấy IPv4 LAN và cập nhật API_BASE_URL trong các file API

const os = require('os');
const fs = require('fs');
const path = require('path');

// Lấy IPv4 LAN
function getLocalIPv4() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return null;
}

const ipv4 = getLocalIPv4();
if (!ipv4) {
  console.error('Không tìm thấy IPv4 LAN!');
  process.exit(1);
}

const apiDir = path.join(__dirname, '../src/api');
const apiFiles = [
  'authApi.ts',
  'userOrderApi.ts',
  'userApi.ts',
  'orderManagementApi.ts',
  'orderApi.ts',
  'menuApi.ts',
  'productApi.ts',
  'adminApi.ts',
];

const newBaseUrl = `http://${ipv4}:8080/api`;
const baseUrlRegex = /const API_BASE_URL = ["'`][^"'`]+["'`];/g;

apiFiles.forEach((file) => {
  const filePath = path.join(apiDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  if (baseUrlRegex.test(content)) {
    content = content.replace(baseUrlRegex, `const API_BASE_URL = "${newBaseUrl}";`);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Đã cập nhật API_BASE_URL trong ${file} thành ${newBaseUrl}`);
  } else {
    console.warn(`Không tìm thấy API_BASE_URL trong ${file}`);
  }
});

console.log('Hoàn tất cập nhật API_BASE_URL!'); 