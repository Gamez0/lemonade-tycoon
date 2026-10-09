# M4 Windows 실기기 검증 — 2026-10-07 KST

판정: **M4 진행 중**. 로컬 Windows 패키지 자동 검사와 사용자 기본 화면·플레이·결과/
다음 날 재실행 확인은 통과했다. 나머지 직접 확인, 실제 네트워크 단절,
clean PC/no Node는 미확인이다. M2 시각 승인과 Steam
검증은 별개이며 완료 처리하지 않는다. 초기 저장 자동 검사에는 실패가 없었으며,
후속 사용자 UI 결함과 수정·회귀 결과는 아래 추가 기록에 구분한다.

## 환경과 보호 범위

- 자동 검사자: Codex, 사용자의 Windows PC에서 실행. 직접 검사자 이름/닉네임은
  사용자에게 요청했으며 아직 응답 없음. 사용자 확인을 자동 관찰로 대체하지 않았다.
- OS: Microsoft Windows 10 Education, 10.0.19045 / build 19045, x64.
- 하드웨어 조회: Gigabyte H410M DS2V, NVIDIA GeForce GTX 1650, 1920×1080.
  `HypervisorPresent=True`도 보고됨. 별도 VM/Windows Sandbox를 만들거나 사용하지
  않았으며 Windows 호스트에서 실행했다. Hypervisor 표시만으로 가상 게스트라고
  판정하지 않는다.
- DPI/배율: **사용자 응답 대기**. PerMonitorSettings의 DpiValue=0이 2개 있으나
  실제 디스플레이 설정의 배율을 확정하는 근거로 사용하지 않았다.
- Node v22.16.0, npm 8.4.0, gh 2.89.0, Edge 154.0.4258.62 설치됨.
  따라서 **깨끗한 PC/no Node 환경이 아니다**. 테스트용 별도 계정은 사용하지 않음.
- 원래 저장소: `C:\Users\dobin\Documents\Projects\lemonade-tycoon`.
  브랜치 `refactor/static-scene-registration`, HEAD
  `96d7765deb7efb3db5b258a1dbc9288c79af3b06`.
  시작/종료 조회에서 수정된 `package.json`, `src/main.ts`, `src/scenes/day-scene.ts`,
  `src/scenes/preparation-scene.ts`, `yarn.lock`과 미추적 `.reboot-work/`, `.yarn/`,
  `.yarnrc.yml` 그대로 유지. reset/clean/stash/원래 작업 트리의 stage를 하지 않았다.
- 검증 worktree: `C:\Users\dobin\Documents\Projects\lemonade-tycoon-m4-windows`,
  브랜치 `verify/m4-windows-device-20261007`, 최신 원격 main
  `aa920a3f49225b3e216be18079afbc533935d2ec`에서 생성.
- 기본 `%LOCALAPPDATA%\Lemonade Tycoon`은 검사 시작 시 존재하지 않았다.
  그 경로를 생성/손상/삭제하지 않았다. 실제 브라우저 프로필도 사용하지 않았다.
  네이티브 회귀는 임시 LOCALAPPDATA/APPDATA, 웹 검사는 Playwright의 별도 Edge
  headless context를 사용했다. 사용자 직접 확인 창은 `.local-m4\manual-data`를 사용한다.
  다운로드/패키지/테스트 저장은 `.local-m4/`에 있으며 커밋하지 않는다.

읽은 문서: AGENTS.md, docs/cloud-work.md, docs/roadmap.md,
m4-windows-manual-checklist.md, m4-desktop-package.md, m4-save-recovery.md.
save-recovery의 초기 v1/미연결 설명은 과거 기록이다. 현재 코드/실제 저장은 v2이며
Electron 연결 상태를 이번 실행에서 확인했다.

## 원격 상태와 패키지 출처

- [PR #128](https://github.com/Gamez0/lemonade-tycoon/pull/128): MERGED,
  2026-10-06T14:04:24Z, merge `aa920a3f49225b3e216be18079afbc533935d2ec`.
  `git merge-base --is-ancestor <merge> origin/main` exit 0.
- [PR #129](https://github.com/Gamez0/lemonade-tycoon/pull/129): OPEN,
  head `91b184e97c94f4d3bb1e49ecb575e7b0d1acd2c1`, docs/cloud-work.md만 +30행.
  ancestry exit 1: **main 미포함**. 최종 체크포인트도 읽었으며, 과거 pending CI
  기록과 이번 실행 결과를 구분한다. 이번 PR에 #129 변경을 중복 반영하지 않는다.
- [PR #83](https://github.com/Gamez0/lemonade-tycoon/pull/83): OPEN, 기존
  refactor/static-scene-registration. 변경/업데이트/병합하지 않았다.

| 패키지 | 정확한 source_commit | 정확한 checkout commit | 실제 Actions run |
| --- | --- | --- | --- |
| 구M4 | f03d1740eefc6d5d845b7fa8564f942811d3192d | 266b82a0832424ade03d87fb695a1b9c30dc83e6 | [37330395029](https://github.com/Gamez0/lemonade-tycoon/actions/runs/37330395029) |
| 신main | aa920a3f49225b3e216be18079afbc533935d2ec | aa920a3f49225b3e216be18079afbc533935d2ec | [37475917496](https://github.com/Gamez0/lemonade-tycoon/actions/runs/37475917496) |

두 run은 API에서 success를 확인했다. artifact 11353324638 / 11418269393은 모두
expired=false이며 다운로드에 성공했다. 만료는 각각 2026-10-08T15:10:00Z /
2026-10-09T14:05:53Z. Node 22/npm으로 로컬 재패키징할 필요는 없었다.
source SHA와 checkout SHA를 구분해서 각 build-info를 보존했다.

- 신패키지: `node scripts/release-manifest.cjs .local-m4/new-package --verify`
  exit 0, **74개 파일의 크기·SHA-256·추가/누락·metadata 일치**.
  manifest 자체 SHA-256:
  `db3eb3a69f2e2fac12b8e10b5288abd044cb42c7edebfd80ae9654828c05983f`。
- 신 `resources/app.asar` SHA-256:
  `9ab75e26e6aaf837e6a60a6a2e4ab1c4bb4955f3d111b1d33b1e73c5bb294fc1`。
- 구 `resources/app.asar` SHA-256:
  `e5c2438a97cb8b55626d857d792c684d74b3f75f7fc5fcaf3c8df90175f3b64e`。
  구build는 manifest 도입 전이므로 **release-manifest.json 없음**. 새 manifest를
  후작성해서 구CI가 검증했다고 주장하지 않는다.
- source SHA/asar가 다른 실제 빌드 간에 교체했다. 두 앱 내부version은
  prototype 0.1.0, save version은2. 제품 semver 변경/새 save schema migration/자동
  updater 검증은 포함하지 않는다. 동일build 폴더 이동과 구분한다.
- 실제 Web: https://gamez0.github.io/lemonade-tycoon/ . 조회된 origin/gh-pages는
  `b5bc8167c297e18f478080bf79334d56ea06344e`, 커밋 메시지는 source
  `aa920a3f49225b3e216be18079afbc533935d2ec`에서 배포됐음을 나타낸다.

## 실행 명령과 자동 결과

PowerShell에서 실행. worktree 생성은 원래 저장소에서, 이후 검사는 검증 worktree에서
실행했다. npm lockfile 변경 없음.

```powershell
git fetch origin
git worktree add -b verify/m4-windows-device-20261007 C:/Users/dobin/Documents/Projects/lemonade-tycoon-m4-windows origin/main
gh pr view 128 --json number,state,mergedAt,mergeCommit,headRefName,url
gh pr view 129 --json number,state,mergedAt,mergeCommit,headRefName,url
gh pr view 83 --json number,state,headRefName,url
gh run download 37475917496 -n windows-prototype-aa920a3f49225b3e216be18079afbc533935d2ec -D .local-m4/new-package
gh run download 37330395029 -n windows-prototype-f03d1740eefc6d5d845b7fa8564f942811d3192d -D .local-m4/old-package
npm ci --no-audit --no-fund
npm test
npm run test:release
npm run build-nolog
node scripts/release-manifest.cjs .local-m4/new-package --verify
$env:LEMONADE_DESKTOP_EXE = (Resolve-Path '.local-m4/new-package/Lemonade Tycoon.exe').Path
npm run test:desktop
$env:LEMONADE_OLD_EXE = (Resolve-Path '.local-m4/old-package/Lemonade Tycoon.exe').Path
$env:LEMONADE_EVIDENCE_ROOT = (New-Item -ItemType Directory -Force .local-m4/evidence).FullName
node scripts/m4-device-evidence.cjs
node --check scripts/m4-device-evidence.cjs
git diff --check
```

모두 exit 0. npm ci 188개 설치, unit/save/file **26/26**, release **3/3**, web
production build 통과. 기존 native suite 전 항목 통과. 추가 device script **5/5**.
스크립트는 첫 실패를 기록한 후 독립 항목을 계속하며 test 저장만 보존한다.
전체 게임의 type/lint/browser suite를 다시 돌렸다고 주장하지 않는다.

추가 스크립트의 첫 실행도 5/5 통과했다. 자체 검토에서 '5초 대기'만으로는 실제 판매
발생을 보장할 수 없고 Playwright가 native download를 종료 시 삭제한다는 근거 부족을
발견했다. 실제 sold>0 및 selling을 기다리고 캡처하며 다운로드 바이트를 재보존하도록
고친 뒤 최종 전체 5/5를 재실행했다. 게임 코드 수정이나 관찰된 게임 결함은 없다.
최종 강제 종료 전 **sold=1**이었다. 아래 증거는 개선 후 실행 것이다.

| 요청 항목 | 실제 자동 검사 결과 | 직접 확인/한계 |
| --- | --- | --- |
| 1 EXE/정상 종료 | PASS: bundled file URL, canvas, native bridge, X와 같은 BrowserWindow.close/flush/relaunch | 사용자 실행·X 종료 후 재실행 확인 PASS. 보안 경고 별도 응답 없음. Node 설치 PC임 |
| 2 offline | PASS(제한): Electron context.setOffline(true) 후 reload와 구매→영업→결과 | OS 네트워크 연결 단절은 **미확인**, no Node clean PC도 미완료 |
| 3 구매/결과/다음 날 저장 | PASS: 준비·결과 JSON byte equality, immediate next-day close/재실행 day=2, history/회계 포함 | 사용자 플레이·결과/다음 날 종료 후 날짜·현금·재고 일치 PASS. 준비 상태만 종료하는 별도 검사는 미확인 |
| 4 강제 종료 | PASS: 실제 taskkill /PID /T /F, selling sold=1 이후; 동일 opening JSON 복구; 재영업 결과가 중단 없는 결과와 deep-equal | 사용자 Task Manager 재현·복구 안내 관찰 대기 |
| 5 실제 Web↔Windows | PASS: 배포 Web의 실제 export download→EXE file import→정상 종료/재실행; EXE download→별도 Edge context import/reload, 전체 JSON 일치 | 자동 UI로 실제 플랫폼 사이 전송함. 사용자 수동 파일 선택/안내는 미확인 |
| 6 잘못된 import/손상 | PASS: malformed와 version999 거부; primary/backup 불변; primary 손상 backup 복구; 양쪽 손상 보호 및 restart/Escape 취소; valid import/재실행 | 임시 경로에서만 손상. 사용자 에러/복구 메시지 관찰 대기 |
| 7 서로 다른 build 교체 | PASS: 구build results 전체 JSON→신build 재실행/native export 동일. source SHA 및 asar hash 다름 | unsigned unpacked build 교체이며 installer/updater/semver migration 아님; 직접 확인 대기 |
| 8 재설치/재배치 | PASS: 동일 test userData, 별도 install copy 실행/종료→그 test install만 삭제→fresh copy/실행, JSON 유지 | 현 배포 방식은 unpacked archive. MSI/uninstaller/Steam 재설치는 제공되지 않음. 직접 확인 대기 |
| 9 저장 위치 | PASS: 테스트 `%LOCALAPPDATA%\Lemonade Tycoon\save*.json`, install folder에 save.json 없음; package manifest 실행 후도 일치 | 실제 개인 저장 경로는 보존. 직접 탐색기 확인 대기 |
| 10 창/DPI/Alt-Tab/조작 | canvas 자동 표시만 확인 | 요청한 창 크기·Alt-Tab·기본 조작은 사용자 PASS. 실제 배율, 다중 DPI 및 전체 키보드/Import 조작은 미확인 |

EXE 자동 검사 중 개발 서버를 띄우지 않았다. 8080/8081/5173에 listening process가
없음을 조회했다. test:desktop은 테스트를 구동하는 Node를 쓰지만 게임은 packaged
EXE다. 이 사실만으로 Node가 없는 다른 PC의 실행 의존성을 검증했다고 하지 않는다.
사용자 창은 종료시키지 않았으며 자동 세션은 종료됐다.

증거: [최종 device report](evidence/m4-windows-20261007/device-results.json),
[신 manifest](evidence/m4-windows-20261007/release-manifest.json),
[구 build-info](evidence/m4-windows-20261007/old-build-info.json),
[신 build-info](evidence/m4-windows-20261007/new-build-info.json),
[강제 종료 직전 캡처](evidence/m4-windows-20261007/before-forced-exit.png).
같은 디렉터리의 old-version-results/updated-results는 교체 비교,
opening-checkpoint/replayed-results는 중단 복구, web-export/native-export는 실제
전송한 테스트 JSON이다. 모두 새 테스트 사업이며 사용자의 실제 사업 데이터가 아니다.
캡처는 M4 재현 근거이며 M2 승인 근거가 아니다.

## 사용자 직접 확인 절차와 응답 기록

2026-10-07 **23:27 KST 기록**. 직접 검사자: 이 채팅의 사용자(이름/닉네임 미제공).
사용자가 처음 답한 원문은 `1오케이`, `2오케이`, 이번 답변은 `3 된다. 4도 된다.`.
번호는 아래 원래 10개 checklist가 아니라 채팅으로 전달한 **4단계 간이 검사**다:

- 1: 창 크기 변경·Alt-Tab 복귀·화면/기본 조작 — 사용자 PASS.
- 2: Supplies 구매→Recipe/Price 변경→OPEN→SKIP→결과 — 사용자 PASS.
- 3: 결과 상태의 날짜·현금·재고 기록→X 종료→격리 launcher 재실행 비교 — 사용자 PASS.
- 4: NEXT DAY→날짜·현금·재고 기록→X 종료→격리 launcher 재실행 비교 — 사용자 PASS.

따라서 이 `4` 응답을 강제 종료 검사 통과로 해석하지 않는다. 사용자가 실행 방법을
질문해 PowerShell에서 launcher를 실행하는 명령을 안내한 후 3/4 성공 응답을 받았다.
구체적인 수치/스크린샷, 보안 경고 여부, 실제 DPI는 아직 제공되지 않았다.
실제 네트워크 단절 및 나머지 직접 확인은 대기이며 M2 시각 승인은 아니다.

재실행: 검증 worktree의 `scripts\m4-manual-launch.cmd` 더블클릭. 이 launcher는
LOCALAPPDATA를 `.local-m4\manual-data`로 격리한다. EXE를 직접 더블클릭하면
일반 사용자 저장 경로를 쓰므로 이 검증에서는 launcher를 사용한다.
아래 손상 작업은 앱을 X로 닫은 다음 이 **test 경로**에서만 한다.

| 직접 확인 | 실행과 관찰할 내용 |
| --- | --- |
| 1 | launcher로 실행. 준비/거리 표시와 보안 경고를 기록. X로 닫고 창·프로세스가 끝나는지 확인 |
| 2 | 네트워크를 실제로 끊고 launcher 재실행→구매→영업→결과→X→재실행. 표시/플레이/저장과 끊은 방법을 기록하고 연결 복구 |
| 3 | 재료 구매, recipe/price 변경, 날짜·현금·재고 기록→X→재실행 비교. 영업 결과와 NEXT DAY 직후에도 같은 비교 |
| 4 | Export save로 opening JSON 보관→OPEN→판매 발생 후 Task Manager에서 해당 테스트 EXE 종료→launcher. 동일 날짜 준비 상태·현금/재고 복구. 다시 영업한 최종 결과에 중복 수익이 없는지 비교 |
| 5 | Edge 별도 Guest/InPrivate 프로필에서 배포 Web을 테스트 플레이→Export→EXE Import. 날짜·현금·재고·plan·history 비교/재실행. EXE Export를 다른 별도 Web 프로필로 Import 후 reload 비교. 기존 브라우저 사업을 가져오기 대상으로 쓰지 않음 |
| 6 | test save 두 파일을 별도 test backup 폴더에 복사. malformed JSON 및 version999 Import에서 에러와 사업 불변 확인. 앱 종료 후 **manual-data\Lemonade Tycoon** primary만 `{`로 바꾸고 재실행해 backup 메시지 확인. 다시 종료 후 양쪽만 손상, 재실행·restart/Escape 취소로 손상 파일 보존 확인. 유효 test export Import로 정상 복구 |
| 7 | 구/신 source SHA를 build-info에서 확인. 같은 격리 LOCALAPPDATA로 old-package EXE에서 결과/Export→종료→new-package 실행/Export 비교. launcher의 패키지 부분만 old-package로 바꾼 별도 test 복사본 사용. 서로 다른 commit 교체 결과로 기록 |
| 8 | EXE 종료 후 disposable 패키지 폴더만 제거하고 동일 아티팩트를 새 폴더에 전체 추출. 동일 격리 LOCALAPPDATA로 실행해 저장 비교. 기존 소스/개인 저장 폴더는 삭제하지 않음 |
| 9 | 탐색기에서 `.local-m4\manual-data\Lemonade Tycoon\save.json` 확인, install folder와 다른지 확인. 개인 저장은 `%LOCALAPPDATA%\Lemonade Tycoon`을 쓰는 설계지만 이번 테스트는 격리 root 사용 |
| 10 | Windows 디스플레이 설정의 실제 해상도·배율 기록. 창 최소/확대, 가능하면 100%/125%/150%, Alt-Tab 복귀 후 탭·주문 취소/구매·recipe/price·speed/SKIP·Export/Import·NEXT DAY·키보드 이동 확인. 잘림/가독성/포커스/오작동을 구체적으로 기록 |

깨끗한 Windows/no Node 장치는 확보되지 않아 **외부 환경 미완료**로 남긴다. 그 환경이
준비되면 전체 archive와 build-info/manifest를 사용해 항목 1–3/9–10을 반복한다.
실제 인터넷 단절은 사용자 관찰이 아직 없어 미확인. 코드 서명 구매/유료 서비스/
Steam 공개 판매는 하지 않았고, Steam 계정/AppID/클라이언트 설치·업데이트 검증도
수행하지 않았다. M5 착수의 M4 수용 전제는 해결되지 않았다.

## 자체 검토

개인 저장/원래 worktree에 쓰는 경로가 없는지, 각 taskkill PID가 자동 Electron
프로세스인지, 삭제 대상이 생성한 disposable install의 하위 경로인지 확인했다.
폴더 교체는 실제 서로 다른 source/asar로 입증하고 relocation과 구분했다.
offline API 결과와 물리 연결 단절, 개발 PC와 clean PC, 자동 검사와 사용자 응답,
M4 캡처와 M2/Steam 승인을 분리했다. 결과 문서·증거·재실행 스크립트만 변경한다.
병합하지 않는다. PR URL/최종 commit은 PR metadata와 cloud-work 체크포인트에서
확인하며, 사용자 응답이 오면 동일 검증 브랜치에 집중해서 추가한다.

게시: [PR #130](https://github.com/Gamez0/lemonade-tycoon/pull/130), OPEN, main 대상.
검증된 스크립트/증거 commit은 `2c7747645c133e3ea729b68e5ea0188caefec767`.
다운로드된 CRLF JSON의 원본 바이트를 git에 보존하며, 후속 attribute에서는 해당
증거 파일의 CR-at-EOL을 허용해서 whitespace check도 통과한다.

## 사용자 UI 결함 및 수정 패키지 — 2026-10-07 23:41 KST 기록

기본 4단계 확인 후 사용자가 두 스크린샷과 함께 가격 입력의 기본 상하 화살표,
창 바깥 여백/이중 제목/기본 Electron 아이콘·메뉴, 오른쪽 페이지 스크롤을 지적했다.
초기 화면 정상 응답을 모든 UI가 수용됐다는 의미로 확장하지 않는다. **M2 미승인**.

재현: 기존 main artifact를 격리 launcher로 실행→Price 탭. 가격만 native number
spinner가 보인다. 1100×850 기본 창에서 안쪽 제목·File/Edit/View/Window 메뉴,
좌우·상단 여백과 하단 버튼/저장 footer를 보기 위한 세로 스크롤이 나타난다.
원인: spinner 제거 CSS가 `.recipe-row`에만 적용되고, 웹용 960px 폭 제한/18px
margin/중복 masthead/고정 최소 높이를 desktop에서도 사용했다. Electron 메뉴와
아이콘도 기본값이었다. 저장/회계 결함이 아니라 패키지 표시·조작의 UI 결함이다.

수정:
- 가격에도 같은 textfield/spin-button 스타일 적용. 직접 숫자 입력·유효성·저장 유지.
- desktop bridge가 있는 경우만 desktop 레이아웃 적용. Native 제목줄을 사용하고
  내부 중복 masthead와 작동하지 않는 legacy 링크 제거, Electron 메뉴 제거.
- 기존 자체 제작 lemon SVG 아이콘을 재사용해 16/32/48/256px ICO 생성하고
  BrowserWindow/EXE에 적용. 원본 `src/desktop/icon.svg`, 생성본 `icon.ico` 포함.
  생성 시 Electron의 숨겨진 renderer에서 SVG→canvas PNG를 만들고 ICO 컨테이너로
  묶었다. 외부 이미지/새 라이선스/유료 생성 서비스 사용 없음.
- 게임 root가 client area를 채우도록 하고, 작은 높이에서는 UI 크기를 맞춘다.
  명시적 grid row와 flex 높이로 모든 주요 조작을 viewport 안에 유지한다.
  거리 canvas는 원래 비율을 유지하며 표시 영역에 맞춘다. 창 비율이 다를 때 거리
  장면 안의 여유 공간은 가능하지만 바깥 웹 프레임/페이지 스크롤은 제거했다.

수정 중 검증: vendor pseudo-element computed style 조회는 실제 pseudo 대신
textfield를 반환해서 첫 assertion을 잘못 작성했다. 일반 input appearance와 실제
캡처로 확인하도록 검사를 수정했다. 이어 canvas 확대를 적용한 중간 build에서
1280×720 Recipe의 START DAY bottom=756.375 > viewport720인 **실제 잘림**을
회귀 검사로 발견했다. implicit grid row의 최소 콘텐츠 높이를
`grid-template-rows: minmax(0, 1fr)`로 제한한 뒤 최종 패키지를 다시 만들어 해결했다.
실패를 단순 overflow:hidden으로 통과시키지 않았다.

최종 로컬 패키지 source/checkout:
`1d84e54bb6e3df496b36f6eac0dc3c017af77c9e`, Node22.16.0/npm8.4.0/
Electron44.5.1, run=`local-windows-ui-fix`. `.local-m4/fixed-package`에 보관.
처음 두 Actions 다운로드와 별개의 **로컬 빌드**이며 기존 패키지를 덮어쓰지 않았다.
`npm run desktop:package:win`, six-file desktop audit, manifest 작성/74파일 검증 통과.
테스트/CI 스크립트 추가는 패키지의 게임 코드 변경 이후 기록이며 native 배포물에
dev package.json은 넣지 않는다.

최종 검사:
- `npm run test:desktop:ui`: 1100×850 / 800×600 / 1280×720의 네 탭(12조합),
  800×600 판매·결과에서 root/주요 버튼/canvas bounds를 검사. root는 client area와
  일치, 가로·세로 document overflow 없음, footer/START DAY/NEXT DAY가 화면 안.
  메뉴/중복 제목 없음, 기존 패키지 appearance=auto→수정 textfield,
  가격2.25 입력→plan225 저장→X/relaunch2.25 유지. PASS.
- 최종 EXE의 `npm run test:desktop`: 기존 저장·flush·강제 종료·손상/전송·재배치 PASS.
- typecheck/lint:reboot, production web build, desktop/test JS syntax PASS.
  별도 headless Edge의 production web 검사에서 기존 masthead/960px web layout 유지,
  가격2.25 입력·reload 저장 PASS. 전체 browser 12/12 재실행이라고 주장하지 않는다.
- UI 회귀를 `tests/desktop-ui.cjs`와 Windows workflow에 추가. 기존 테스트와 모두
  격리된 temp 저장을 사용한다. 초기 증거 JSON/이미지/manifest는 보존한다.

수정 증거: [UI 결과](evidence/m4-windows-20261007/ui-fix/ui-results.json),
[가격 캡처](evidence/m4-windows-20261007/ui-fix/price-fixed.png),
[작은 창 결과](evidence/m4-windows-20261007/ui-fix/results-small.png),
[로컬 build-info](evidence/m4-windows-20261007/ui-fix/build-info.json),
[manifest](evidence/m4-windows-20261007/ui-fix/release-manifest.json).

**수정 패키지의 사용자 재확인은 아직 없음**. 현재 창을 X로 종료한 뒤 다음 실행기로
같은 격리 test business를 이어한다. 실제 개인 저장은 사용하지 않는다.

```powershell
& "C:\Users\dobin\Documents\Projects\lemonade-tycoon-m4-windows\scripts\m4-price-fix-launch.cmd"
```

가격 화살표, 기본 메뉴/아이콘, 중복 제목/바깥 여백/우측 스크롤이 사라졌는지와
작은 창에서도 주요 버튼이 보이고 조작되는지 직접 확인을 요청한다. 기존
`m4-manual-launch.cmd`는 원래 Actions 패키지이며 수정판으로 바꾸지 않았다.
이후 offline/DPI 등 남은 M4 검사를 계속한다. M2/Steam을 완료 처리하지 않는다.

## 후속 전체 회귀 검증 — 2026-10-08 KST

PR #130 head `cd5916cf5e372ac771f39850fa0e3e5893e5571d`에서 로컬 검증을 이어했다.
단위/저장 26/26, 배포 검사 3/3, typecheck/lint, production web build 및 전체
browser 12/12 PASS. 기존 수정 EXE의 native save suite와 UI suite도 다시 PASS했고
manifest 74파일이 일치했다. 패키지 source `1d84e54` 이후 PR head까지 배포 runtime
소스/config/packager 차이는 없다. 해당 PR head의 원격 검사 7개도 모두 SUCCESS.

첫 browser 시도는 비동기 build 프로세스 종료 전에 시작해서 루트 404로 실패했다.
시도를 중단하고 build 종료와 HTTP200을 확인한 후 변경 없는 전체 suite를 다시
실행해 12/12 PASS를 확인했다. 제품 코드 수정은 없으며 처음 실패를 숨기지 않는다.
새 사용자 시각 수용·물리 단절·DPI·clean-PC 증거는 추가되지 않았다. M4/M2/Steam
판정은 그대로 열어 두며 병합하지 않는다. 이번에 시작한 preview/자동 앱은 종료했다.
