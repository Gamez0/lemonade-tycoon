# Willow Lane Lemonade

[English](README.md) · 한국어

[![Checks](https://github.com/Gamez0/lemonade-tycoon/actions/workflows/checks.yml/badge.svg?branch=main)](https://github.com/Gamez0/lemonade-tycoon/actions/workflows/checks.yml)

[마일스톤](https://github.com/Gamez0/lemonade-tycoon/milestones) · [GitHub 작업 안내](docs/github-operations.md) · [질문과 피드백](https://github.com/Gamez0/lemonade-tycoon/discussions)

Phaser와 TypeScript로 만드는 동네 레모네이드 가게 경영 게임입니다. 재료를 사고, 레시피와 가격을 조절하고, 손님을 맞이한 뒤 하루의 결과를 바탕으로 다음 날을 준비합니다.

고전 PC 경영 게임의 작은 녹색 패널, 입체 버튼, 그림으로 표현한 재고와 대각선 거리 장면을 따릅니다. Results, Rent, Upgrades, Staff, Marketing, Recipe, Supplies의 일곱 탭과 5:4 거리 화면을 함께 보여 줍니다. 게임의 현재 지원 언어는 영어입니다.

## 개발 환경에서 실행하기

Node.js 22와 npm을 사용합니다. 저장소에 커밋된 `package-lock.json`을 기준으로 설치합니다.

```sh
npm ci
npm run dev-nolog
```

새 게임은 http://localhost:8080 에서 실행됩니다. 이전 게임은 http://localhost:8080/legacy.html 에 보존되어 있습니다. `npm run build-nolog`는 두 진입점을 모두 `dist/`에 빌드합니다.

## 게임 진행

$40와 빈 재고로 시작합니다. Supplies에서 재료와 묶음 수량을 선택한 뒤 BUY로 주문 전체를 결제합니다. CANCEL은 주문을 취소합니다. 결제 전에는 현금과 재고가 바뀌지 않습니다. 피처당 레몬·설탕과 컵당 얼음 수량을 정하고, $0.25~$5.00 범위에서 가격을 입력합니다. 날씨에 맞는 레시피 힌트를 참고할 수 있습니다.

가게를 열면 준비가 확정되고 손님들이 걷고, 줄을 서고, 구매하거나 떠납니다. 속도 버튼은 하루를 4배속으로 진행합니다. SKIP은 같은 시간 계산 규칙으로 남은 방문과 대기열을 처리하고 결과를 보여 줍니다.

Results에서 마지막 하루와 누적 손익을 확인합니다. 이익에는 사용한 재료, 임대료, 이사비, 임금과 광고비가 반영됩니다. 현금 변화에는 재료 구매와 장비 투자도 포함됩니다. 남은 재고·현금·장소별 평판은 다음 날로 이어지며, 냉장 장비가 없으면 남은 얼음이 녹습니다. 현금 $75를 목표로 삼되 이후에도 계속 플레이할 수 있습니다. New business를 두 번 선택하면 초기화되며, Escape나 포커스 이동으로 확인을 취소할 수 있습니다.

Rent에서 무료 Neighborhood, Riverside Park, Downtown을 비교합니다. Park는 3일 완료·누적 매출 $45·만족도 55%, Downtown은 7일·$120·65%에 해금됩니다. 해금은 유지됩니다. 예약을 확정해야 장소가 변경됩니다. Park는 하루 $2와 입장 이사비 $1, Downtown은 하루 $5와 이사비 $3가 듭니다. Neighborhood 복귀는 무료입니다. 하루 시작 비용은 한 번만 부과되며 중단된 하루를 재생해도 다시 청구하지 않습니다.

세 종류의 장비에는 각각 두 단계가 있습니다. 구입한 제빙기는 생산비나 전기요금 없이 얼음을 만듭니다. 별도로 구입한 얼음의 구매 원가는 유지됩니다. Staff에서 인력을 선택하고, Marketing에서 가격과 전단지·라디오 광고를 설정합니다. Help / Sound에서 안내, 음악·효과음별 음량, 음소거와 전체 화면을 사용할 수 있습니다. 음악과 효과음은 코드로 작곡한 자체 제작 음원입니다.

## 저장과 Windows 실행

진행 상황은 현재 기기에 자동 저장됩니다. 판매 중 다시 실행하면 비용을 이미 지불한 당일 시작 상태로 돌아갑니다. Export save로 백업을 내보내고 Import save로 복원할 수 있습니다. 브라우저 저장은 동기화되지 않으며 브라우저 데이터 삭제 시 사라질 수 있습니다. v6 저장 형식은 이전 저장을 받아들이면서 과거 현금·매출·재료 원가를 보존합니다. 영업 시작 때 첫 피처를 만들고, 판매 중 비면 재료가 있는 한 즉시 다시 만듭니다. 준비된 첫 피처는 재실행해도 중복 생산하지 않습니다. 업데이트 전에 저장을 내보내세요. 이전 실행판은 v6 저장을 읽을 수 없습니다. 자세한 내용은 [저장·복구 정책](docs/reviews/m4-save-recovery.md)과 [장소 진행 검토](docs/reviews/m5-locations.md)를 참고하세요.

```sh
npm run desktop:package:win
```

`release/Lemonade Tycoon-win32-x64/`의 실행 파일을 실행합니다. 전체 폴더를 함께 배포해야 합니다. 저장은 설치 폴더와 별개인 `%LOCALAPPDATA%\Lemonade Tycoon`에 기록됩니다. 패키지 검사·체크섬·ZIP·내부 릴리스 초안 절차는 [운영 안내](docs/release/operations.md)에 있습니다. 개발용 격리 테스트에서는 사업 저장 경로와 Chromium 프로필을 함께 분리해야 합니다.

## 변경 검증

```sh
npm test
npm run test:release
npm run typecheck
npm run lint:reboot
npm run build-nolog
npx playwright install chromium
npm run test:browser
```

브라우저 검사는 데스크톱·작은 화면의 하루 진행, 주문·취소, 자금 부족, 입력 검증, 손익, 재시작, 속도·SKIP과 화면 배치를 검증합니다. 실제 AudioContext의 중단·복귀도 확인합니다. 시뮬레이션 검사는 동시 도착, 대기열 이탈과 일회성 정산 등을 다룹니다. 스크린샷과 실패 추적은 `test-results/`에 남습니다.

Windows CI는 실제 패키지의 저장·복구, UI, 렌더링 배율, 장소, 경영, 오디오와 30일 사업 진행을 검사합니다. 네이티브 검사를 직접 실행하려면 `LEMONADE_DESKTOP_EXE`를 패키지 실행 파일 경로로 설정하고 [운영 안내](docs/release/operations.md)의 명령을 따릅니다.

엄격한 타입 검사와 경고 없는 린트는 새 게임에 적용됩니다. 이전 코드의 기존 타입·린트 문제는 [저장소 조사](docs/repository-audit.md)에 기록되어 있습니다. 저장소 전체의 `npx tsc --noEmit`과 `npm run lint`는 새 게임의 출시 검사 기준이 아닙니다.

## 프로젝트 자료와 출시 상태

- [게임 설계](docs/game-design.md)
- [구조](docs/architecture.md)
- [미술 방향과 자산 목록](docs/art-assets.md)
- [출시 로드맵](docs/roadmap.md)
- [Steam 준비](docs/release/steam-readiness.md)
- [스토어 초안](docs/release/store-draft.md)

새 게임의 장면·캐릭터는 코드로 제작한 자체 미술입니다. 기존 자산은 이전 게임에 남아 있고 참고 스크린샷은 패키지에 포함하지 않습니다. [원작 비교 보드](docs/research/m2-reference-board.html)와 [M6~M10 검토](docs/reviews/m6-m10-development.md)에서 구현 근거를 확인할 수 있습니다.

현재 후보는 내부 테스트용 alpha입니다. 사람의 플레이·미술·청취 수용, 깨끗한 Windows PC와 물리적 DPI 검사는 현재 엔지니어링 진행에서 보류되어 있으며 자동 검사로 완료 처리하지 않습니다. Steam 계정·실제 설치·제출과 공개 배포는 별도 조건입니다. 보류된 수동 항목을 이유로 구현·검증·병합·내부 후보 준비를 멈추지 않습니다.
