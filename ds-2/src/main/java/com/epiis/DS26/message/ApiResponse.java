package com.epiis.DS26.message;

public class ApiResponse<T> {
    private GenericResponse response;
    private T data;

    public ApiResponse() {
    }

    public ApiResponse(GenericResponse response, T data) {
        this.response = response;
        this.data = data;
    }

    public GenericResponse getResponse() {
        return response;
    }

    public void setResponse(GenericResponse response) {
        this.response = response;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }

}
