import { testConnection } from './db/connection';
import { collectAndSaveData } from './services/collector';

async function main() {
  console.log('🚀 한국관광공사 데이터 수집기 시작\n');
  console.log('='.repeat(60));

  try {
    // 1. DB 연결 테스트
    console.log('1️⃣  PostgreSQL 연결 확인 중...');
    const isConnected = await testConnection();

    if (!isConnected) {
      console.error('❌ DB 연결 실패. .env 파일을 확인하세요.');
      process.exit(1);
    }

    console.log('\n2️⃣  데이터 수집 및 저장 시작...');
    console.log('='.repeat(60));

    // 2. 데이터 수집 및 저장
    await collectAndSaveData();

    console.log('✅ 모든 작업이 완료되었습니다!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ 오류 발생:', error);
    process.exit(1);
  }
}

main();
