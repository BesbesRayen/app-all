package com.creaditn.creaditnbackend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class SupportTicketDto {
    private Long id;
    private Long userId;
    private String subject;
    private String status;
    private LocalDateTime createdAt;
}
