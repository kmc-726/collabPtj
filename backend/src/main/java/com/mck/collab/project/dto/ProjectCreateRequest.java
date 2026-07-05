package com.mck.collab.project.dto;

import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ProjectCreateRequest {

    private String name;
    private String description;
    private List<String> memberUserIds;
}
