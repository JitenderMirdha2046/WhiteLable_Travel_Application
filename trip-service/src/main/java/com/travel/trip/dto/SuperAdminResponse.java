package com.travel.trip.dto;

import java.util.UUID;

public class SuperAdminResponse {

    private UUID id;
    private String name;
    private String email;
    private String token;

    public SuperAdminResponse(UUID id, String name, String email, String token) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.token = token;
    }

    public UUID getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getToken() { return token; }
}
