package com.travel.trip.dto;

import java.math.BigDecimal;
import java.util.UUID;

public class BrandingResponse {

    private UUID tenantId;
    private String agencyName;
    private String logoUrl;
    private String backgroundImage;
    private Integer overlayOpacity;
    private String overlayBlur;
    private String templateStyle;
    private String primaryColor;
    private String accentColor;
    private String tagline;
    private String subdomain;
    private Integer orbIntensity;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String phone;
    private String address;
    private String email;

    public BrandingResponse(UUID tenantId, String agencyName, String logoUrl,
                            String backgroundImage, Integer overlayOpacity, String overlayBlur,
                            String templateStyle,
                            String primaryColor, String accentColor,
                            String tagline, String subdomain, Integer orbIntensity,
                            BigDecimal latitude, BigDecimal longitude, String phone, String address,
                            String email) {
        this.tenantId = tenantId;
        this.agencyName = agencyName;
        this.logoUrl = logoUrl;
        this.backgroundImage = backgroundImage;
        this.overlayOpacity = overlayOpacity;
        this.overlayBlur = overlayBlur;
        this.templateStyle = templateStyle;
        this.primaryColor = primaryColor;
        this.accentColor = accentColor;
        this.tagline = tagline;
        this.subdomain = subdomain;
        this.orbIntensity = orbIntensity;
        this.latitude = latitude;
        this.longitude = longitude;
        this.phone = phone;
        this.address = address;
        this.email = email;
    }

    public UUID getTenantId() { return tenantId; }
    public String getAgencyName() { return agencyName; }
    public String getLogoUrl() { return logoUrl; }
    public String getBackgroundImage() { return backgroundImage; }
    public Integer getOverlayOpacity() { return overlayOpacity; }
    public String getOverlayBlur() { return overlayBlur; }
    public String getTemplateStyle() { return templateStyle; }
    public String getPrimaryColor() { return primaryColor; }
    public String getAccentColor() { return accentColor; }
    public String getTagline() { return tagline; }
    public String getSubdomain() { return subdomain; }
    public Integer getOrbIntensity() { return orbIntensity; }
    public BigDecimal getLatitude() { return latitude; }
    public BigDecimal getLongitude() { return longitude; }
    public String getPhone() { return phone; }
    public String getAddress() { return address; }
    public String getEmail() { return email; }
}
