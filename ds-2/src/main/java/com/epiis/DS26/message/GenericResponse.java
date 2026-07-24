package com.epiis.DS26.message;

import java.util.ArrayList;
import java.util.List;

public class GenericResponse {
	private String type;
	public List<String> listMessage;

	public GenericResponse() {
		this.type = "error";
		this.listMessage = new ArrayList<>();
	}

	public String getType() {
		return this.type;
	}

	public void success() {
		this.type = "success";
	}

	public void warning() {
		this.type = "warning";
	}

	public void error() {
		this.type = "error";
	}

	public void exception() {
		this.type = "exception";
	}

	public List<String> getListMessage() {
		return listMessage;
	}

	public void setListMessage(List<String> listMessage) {
		this.listMessage = listMessage;
	}
}
