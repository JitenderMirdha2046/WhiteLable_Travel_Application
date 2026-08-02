package com.travel.trip.dto;

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
    private Double latitude;
    private Double longitude;
    private String phone;
    private String address;

    public BrandingResponse(UUID tenantId, String agencyName, String logoUrl,
                            String backgroundImage, Integer overlayOpacity, String overlayBlur,
                            String templateStyle,
                            String primaryColor, String accentColor,
                            String tagline, String subdomain, Integer orbIntensity,
                            Double latitude, Double longitude, String phone, String address) {
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
    public Double getLatitude() { return latitude; }
    public Double getLongitude() { return longitude; }
    public String getPhone() { return phone; }
    public String getAddress() { return address; }
}
