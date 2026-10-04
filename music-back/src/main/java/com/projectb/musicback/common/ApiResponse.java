package com.projectb.musicback.common;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(
        int code,
        String message,
        T data
) {
    public static <T> ApiResponse<T> success(T data){
        return new ApiResponse<T>(1000, "Success", data);
    }

    public static <T> ApiResponse<T> error(int code, String message) {
        return new ApiResponse<T>(code, message, null);
    }

    public static <T> ApiResponse<T> found(T data) {
        return new ApiResponse<T>(2000, "Found", data);
    }
}
