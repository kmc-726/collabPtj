package com.mck.collab.websocket;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class DocumentWebSocketController {

    // 클라이언트가 /app/document/{docId} 로 메시지 보내면
    // /topic/document/{docId} 를 구독 중인 모든 클라이언트에 브로드캐스트
    @MessageMapping("/document/{docId}")
    @SendTo("/topic/document/{docId}")
    public DocumentMessage handleDocumentEdit(
            @DestinationVariable("docId") String docId,
            DocumentMessage message) {
        return message;
    }
}
