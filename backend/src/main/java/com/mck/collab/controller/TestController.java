package com.mck.collab.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class TestController {

    // 브라우저나 리액트에서 /api/hello 로 GET 요청을 보내면 이 메서드가 실행됩니다.
    @GetMapping("/hello")
    public ResponseEntity<Map<String, String>> helloApi() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "백엔드 서버와 오라클 DB가 완벽하게 준비되었습니다! 🎉");
        
        // JSON 형태로 예쁘게 응답을 내려줍니다.
        return ResponseEntity.ok(response);
    }
}