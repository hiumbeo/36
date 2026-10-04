const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const serverDist = path.resolve(__dirname, 'dist', 'server.cjs');

// Nếu file dist/server.cjs chưa tồn tại (do Render chưa chạy lệnh build), tự động build ngay lập tức
if (!fs.existsSync(serverDist)) {
  console.log('[*] dist/server.cjs chưa tồn tại. Đang tự động build dự án...');
  try {
    execSync('npm run build', { stdio: 'inherit', cwd: __dirname });
    console.log('[✔] Build dự án thành công!');
  } catch (err) {
    console.warn('[!] Lỗi khi build, đang chuyển sang khởi chạy trực tiếp qua tsx server.ts...', err.message);
    try {
      execSync('npx tsx server.ts', { stdio: 'inherit', cwd: __dirname });
      process.exit(0);
    } catch (e) {
      console.error('[X] Không thể khởi động server:', e.message);
      process.exit(1);
    }
  }
}

// Khởi chạy server production
require('./dist/server.cjs');
