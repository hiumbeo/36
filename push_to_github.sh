#!/bin/bash
# ========================================================
# Script Tự Động Đẩy Mã Nguồn Discord Selfbot Lên GitHub
# ========================================================

REPO_URL=$1

echo "========================================================"
echo "🚀 ĐANG CHUẨN BỊ ĐẨY MÃ NGUỒN DISCORD SELFBOT LÊN GITHUB"
echo "========================================================"

if [ -z "$REPO_URL" ]; then
  echo "⚠️  LƯU Ý: Bạn chưa cung cấp link GitHub Repository!"
  echo "Cách sử dụng:"
  echo "   ./push_to_github.sh https://github.com/USERNAME/discord-selfbot.git"
  echo ""
  echo "Hoặc bạn có thể chạy các lệnh thủ công:"
  echo "   git remote add origin <URL_REPO_CUA_BAN>"
  echo "   git branch -M main"
  echo "   git push -u origin main"
  exit 1
fi

# Cấu hình git nếu chưa có
git config user.name "NguyenDev"
git config user.email "thanhphutv123@gmail.com"

# Stage all files
git add .

# Commit
git commit -m "feat: Discord Selfbot AFK 24/7 with Prefix Commands, Voice AFK, and Render.com Deploy" || true

# Set main branch
git branch -M main

# Remote
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_URL"

echo "📦 Đang đẩy mã nguồn lên $REPO_URL..."
git push -u origin main

if [ $? -eq 0 ]; then
  echo "✅ THÀNH CÔNG! Mã nguồn đã được tải lên GitHub."
  echo "👉 Bước tiếp theo: Vào https://dashboard.render.com/ -> New Web Service -> Chọn repo này để chạy 24/7!"
else
  echo "❌ Đẩy mã nguồn thất bại. Vui lòng kiểm tra quyền truy cập (GitHub Personal Access Token hoặc SSH Key)."
fi
