package com.ems.dto;
import com.ems.modal.User;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UserResponse {
    private Long userId;
    private String username;
    private String role;
    private Long reportingId;

    public UserResponse(User user) {
        this.userId = user.getUserId();
        this.username = user.getUsername();
        this.role = user.getRole().name();
        this.reportingId = user.getReportingId();
    }
}