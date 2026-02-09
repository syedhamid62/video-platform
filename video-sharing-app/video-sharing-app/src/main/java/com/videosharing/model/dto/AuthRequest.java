package com.videosharing.model.dto;


public class AuthRequest {
    private String email;
    private String password;
    
    // Constructors, getters, and setters
    public AuthRequest() {}
    
    public AuthRequest(String email, String password) {
        this.email = email;
        this.password = password;
    }

    
    
    
    // Getters and setters...
	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

 
    
    
    
    
    
}
