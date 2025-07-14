package com.devsoncall.cards.dto;

import java.time.LocalDateTime;

import org.springframework.http.HttpStatusCode;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ErrorResponseDto {

	private String apiPath;

	private HttpStatusCode errorCode;

	private String errorMessage;

	private LocalDateTime errorTime;
}
