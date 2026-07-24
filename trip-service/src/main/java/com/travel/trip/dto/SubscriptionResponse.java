package com.travel.trip.dto;

public class SubscriptionResponse {
    private String sessionId;
    private String sessionUrl;
    private String status;

    public SubscriptionResponse(String sessionId, String sessionUrl, String status) {
        this.sessionId = sessionId;
        this.sessionUrl = sessionUrl;
        this.status = status;
    }

    public String getSessionId() { return sessionId; }
    public String getSessionUrl() { return sessionUrl; }
    public String getStatus() { return status; }
}
