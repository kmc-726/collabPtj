package com.mck.collab.document.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DocumentCreateRequest {

    @NotBlank(message = "문서 제목을 입력해주세요.")
    @Size(max = 300, message = "문서 제목은 300자 이하로 입력해주세요.")
    private String title;

    private String content;

    @Size(max = 500, message = "태그는 500자 이하로 입력해주세요.")
    private String tags;
}
