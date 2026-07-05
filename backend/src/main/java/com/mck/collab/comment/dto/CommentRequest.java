package com.mck.collab.comment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommentRequest {

    @NotNull(message = "문서 ID는 필수입니다.")
    private String documentId;

    @NotBlank(message = "블록 ID는 필수입니다.")
    private String blockId;

    @NotBlank(message = "댓글 내용을 입력해 주세요.")
    @Size(max = 2000, message = "댓글은 2000자 이내여야 합니다.")
    private String content;

    private Long parentId;
}
