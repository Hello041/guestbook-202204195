# 01: 방명록 뼈대: 헤더, 빈 목록, 테스트 환경

**What to build:** 방문자가 앱을 열면 기본 create-next-app 화면 대신 방명록 페이지가 보인다. 헤더에는 제목 "미니 방명록"과 `개발자: 김정효 (202204195)`가 있고, 아직 방명록 글(Entry)이 없으므로 "아직 작성된 글이 없습니다. 첫 글을 남겨보세요!"가 표시된다. 이후 티켓이 쉬워지도록 방명록 모듈과 저장소 인터페이스의 틀, 메모리 저장소, 테스트 환경을 먼저 갖춘다 (prefactor). 스펙: `.scratch/guestbook/spec.md`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] `package.json`의 `name`이 `guestbook-app`이다
- [ ] 기본 create-next-app 화면과 쓰이지 않는 기본 에셋이 제거되었다
- [ ] 헤더에 "미니 방명록"과 `개발자: 김정효 (202204195)`가 항상 표시된다
- [ ] 글이 없을 때 빈 목록 안내 문구가 표시된다
- [ ] 페이지는 방명록 모듈의 `listEntries()`로 목록을 그린다 (이 단계에서는 빈 목록)
- [ ] 방명록 모듈이 저장소 인터페이스를 주입받는 구조이며, 메모리 저장소 구현이 있다
- [ ] 공개 Entry 타입에 비밀번호·해시 필드가 없다
- [ ] Vitest가 설치되어 있고 `npm test`로 실행된다
- [ ] "빈 방명록이면 `listEntries()`가 빈 목록을 돌려준다" 테스트가 통과한다
- [ ] 코드 작성 전에 `node_modules/next/dist/docs/`의 관련 가이드를 확인했다 (AGENTS.md)
- [ ] `npm run build`와 `npm run lint`가 통과한다
