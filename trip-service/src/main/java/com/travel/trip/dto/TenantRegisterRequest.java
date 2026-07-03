package com.travel.trip.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class TenantRegisterRequest {

    @NotBlank(message = "Agency name is required")
    private String agencyName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String adminEmail;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String adminPassword;

    private String subdomain;

    private String domain;

    public String getAgencyName() { return agencyName; }
    public void setAgencyName(String agencyName) { this.agencyName = agencyName; }
    public String getAdminEmail() { return adminEmail; }
    public void setAdminEmail(String adminEmail) { this.adminEmail = adminEmail; }
    public String getAdminPassword() { return adminPassword; }
    public void setAdminPassword(String adminPassword) { this.adminPassword = adminPassword; }
    public String getSubdomain() { return subdomain; }
    public void setSubdomain(String subdomain) { this.subdomain = subdomain; }
    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }
}
