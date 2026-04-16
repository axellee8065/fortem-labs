#!/bin/bash
# ForTem Labs - Railway 배포 스크립트
# 사용법: 터미널에서 railway login 후 bash deploy.sh 실행

set -e

echo "🏢 ForTem Labs - Railway 배포 시작"
echo "=================================="

# 1. Railway 로그인 확인
echo "📋 Railway 인증 상태 확인..."
railway whoami || { echo "❌ railway login을 먼저 실행하세요"; exit 1; }

# 2. 프로젝트 초기화 (새 프로젝트 생성)
echo ""
echo "🚀 Railway 프로젝트 초기화..."
railway init

# 3. GitHub 레포 연결
echo ""
echo "🔗 GitHub 레포 연결..."
railway add --repo axellee8065/fortem-labs

# 4. 배포
echo ""
echo "📦 배포 시작..."
railway up --detach

echo ""
echo "✅ 배포 완료!"
echo "💡 'railway domain' 으로 공개 URL을 생성할 수 있습니다."
echo "💡 'railway open' 으로 대시보드를 열 수 있습니다."
