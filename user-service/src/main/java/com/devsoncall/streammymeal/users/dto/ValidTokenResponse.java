package com.devsoncall.streammymeal.users.dto;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class ValidTokenResponse {
    private boolean valid;
}
