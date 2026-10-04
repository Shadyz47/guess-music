package com.projectb.musicback.common;

public abstract class BaseController {

    protected <T> ApiResponse<T> success(T data){
        return ApiResponse.success(data);
    }

    protected <T> ApiResponse<T> error(int code, String message){
        return ApiResponse.error(code, message);
    }

    protected <T> ApiResponse<T> found(T data){
        return ApiResponse.found(data);
    }
}
