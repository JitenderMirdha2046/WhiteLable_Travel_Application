package com.travel.trip.dto;

public class BrandingRequest {

    private String logoUrl;
    private String backgroundImage;
    private Integer overlayOpacity;
    private String overlayBlur;
    private String templateStyle;
    private String primaryColor;
    private String accentColor;
    private String tagline;
    private Integer orbIntensity;
    private Double latitude;
    private Double longitude;
    private String phone;
    private String address;

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
    public String getPrimaryColor() { return primaryColor; }
    public void setPrimaryColor(String primaryColor) { this.primaryColor = primaryColor; }
    public String getAccentColor() { return accentColor; }
    public void setAccentColor(String accentColor) { this.accentColor = accentColor; }
    public String getTagline() { return tagline; }
    public void setTagline(String tagline) { this.tagline = tagline; }
    public Integer getOrbIntensity() { return orbIntensity; }
    public void setOrbIntensity(Integer orbIntensity) { this.orbIntensity = orbIntensity; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
}
