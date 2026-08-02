package com.travel.trip.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tenants")
public class Tenant {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(unique = true, length = 255)
    private String domain;

    @Column(unique = true, length = 100)
    private String subdomain;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "background_image", length = 500)
    private String backgroundImage;

    @Column(name = "overlay_opacity")
    private Integer overlayOpacity;

    @Column(name = "overlay_blur", length = 20)
    private String overlayBlur;

    @Column(name = "template_style", length = 50)
    private String templateStyle;

    @Column(name = "orb_intensity")
    private Integer orbIntensity;

    @Column(name = "primary_color", length = 20)
    private String primaryColor;

    @Column(name = "accent_color", length = 20)
    private String accentColor;

    @Column(length = 200)
    private String tagline;

    @Column(name = "plan_type", length = 20)
    private String planType;

    @Column(length = 20)
    private String status;

    @Column(name = "admin_email", length = 255)
    private String adminEmail;

    @Column(name = "admin_password", length = 255)
    private String adminPassword;

    @Column(name = "stripe_customer_id", length = 255)
    private String stripeCustomerId;

    @Column(name = "subscription_id", length = 255)
    private String subscriptionId;

    @Column(name = "subscription_status", length = 50)
    private String subscriptionStatus;

    @Column(name = "trial_ends_at")
    private LocalDateTime trialEndsAt;

    @Column(name = "subscription_ends_at")
    private LocalDateTime subscriptionEndsAt;

    @Column(precision = 10, scale = 7)
    private Double latitude;

    @Column(precision = 10, scale = 7)
    private Double longitude;

    @Column(length = 20)
    private String phone;

    @Column(length = 500)
    private String address;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (primaryColor == null) primaryColor = "#3b82f6";
        if (accentColor == null) accentColor = "#a855f7";
        if (overlayOpacity == null) overlayOpacity = 70;
        if (overlayBlur == null) overlayBlur = "sm";
        if (templateStyle == null) templateStyle = "modern";
        if (orbIntensity == null) orbIntensity = 10;
        if (planType == null) planType = "starter";
        if (status == null) status = "active";
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }
    public String getSubdomain() { return subdomain; }
    public void setSubdomain(String subdomain) { this.subdomain = subdomain; }
    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }
    public String getBackgroundImage() { return backgroundImage; }
    public void setBackgroundImage(String backgroundImage) { this.backgroundImage = backgroundImage; }
    public Integer getOverlayOpacity() { return overlayOpacity; }
    public void setOverlayOpacity(Integer overlayOpacity) { this.overlayOpacity = overlayOpacity; }
    public String getOverlayBlur() { return overlayBlur; }
    public void setOverlayBlur(String overlayBlur) { this.overlayBlur = overlayBlur; }
    public String getTemplateStyle() { return templateStyle; }
    public void setTemplateStyle(String templateStyle) { this.templateStyle = templateStyle; }
    public Integer getOrbIntensity() { return orbIntensity; }
    public void setOrbIntensity(Integer orbIntensity) { this.orbIntensity = orbIntensity; }
    public String getPrimaryColor() { return primaryColor; }
    public void setPrimaryColor(String primaryColor) { this.primaryColor = primaryColor; }
    public String getAccentColor() { return accentColor; }
    public void setAccentColor(String accentColor) { this.accentColor = accentColor; }
    public String getTagline() { return tagline; }
    public void setTagline(String tagline) { this.tagline = tagline; }
    public String getPlanType() { return planType; }
    public void setPlanType(String planType) { this.planType = planType; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getAdminEmail() { return adminEmail; }
    public void setAdminEmail(String adminEmail) { this.adminEmail = adminEmail; }
    public String getAdminPassword() { return adminPassword; }
    public void setAdminPassword(String adminPassword) { this.adminPassword = adminPassword; }
    public String getStripeCustomerId() { return stripeCustomerId; }
    public void setStripeCustomerId(String stripeCustomerId) { this.stripeCustomerId = stripeCustomerId; }
    public String getSubscriptionId() { return subscriptionId; }
    public void setSubscriptionId(String subscriptionId) { this.subscriptionId = subscriptionId; }
    public String getSubscriptionStatus() { return subscriptionStatus; }
    public void setSubscriptionStatus(String subscriptionStatus) { this.subscriptionStatus = subscriptionStatus; }
    public LocalDateTime getTrialEndsAt() { return trialEndsAt; }
    public void setTrialEndsAt(LocalDateTime trialEndsAt) { this.trialEndsAt = trialEndsAt; }
    public LocalDateTime getSubscriptionEndsAt() { return subscriptionEndsAt; }
    public void setSubscriptionEndsAt(LocalDateTime subscriptionEndsAt) { this.subscriptionEndsAt = subscriptionEndsAt; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
