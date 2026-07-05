package com.mck.collab.websocket;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DocumentMessage {

    // 메시지 타입: EDIT(내용 변경), JOIN(입장), LEAVE(퇴장), CURSOR(커서 위치)
    private String type;

    // 편집한 사용자 닉네임
    private String senderNickname;

    // 변경된 필드 (title / content / tags)
    private String field;

    // 변경된 값
    private String value;
}
