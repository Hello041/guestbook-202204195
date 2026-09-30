# Guestbook

A mini guestbook where anyone can leave a short note, with no accounts. Each note carries its own password, which is the only thing that allows it to be edited or deleted.

## Language

**Entry** (방명록 글):
A single note in the guestbook, made up of an author name, a message, a created time and a password.
_Avoid_: Post, comment, 게시물, 댓글

**Message** (메시지):
The body text of an entry, and the only part of an entry that can be edited.
_Avoid_: Content, body, 내용

**Author name** (작성자 이름):
The name typed in when an entry is written. It is a label, not an identity: two entries may share one.
_Avoid_: User, account, username, 사용자, 글쓴이

**Password** (비밀번호):
A secret chosen when an entry is written, tied to that one entry only, and the sole proof of the right to edit or delete it.
_Avoid_: Login, credential, PIN

**Created time** (작성 시각):
The moment an entry was first written. It never changes and is the order the guestbook is listed in (newest first).
_Avoid_: Date, posted at

**Edited** (수정됨):
The state of an entry whose message has been changed at least once after it was written.
