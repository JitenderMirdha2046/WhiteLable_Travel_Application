package com.travel.trip.dto;

import java.util.List;

public class PricingPlanResponse {
    private String name;
    private int price;
    private String period;
    private String description;
    private List<String> features;
    private boolean popular;
    private String priceId;

    public PricingPlanResponse(String name, int price, String period, String description,
                               List<String> features, boolean popular, String priceId) {
        this.name = name;
        this.price = price;
        this.period = period;
        this.description = description;
        this.features = features;
        this.popular = popular;
        this.priceId = priceId;
    }

    public String getName() { return name; }
    public int getPrice() { return price; }
    public String getPeriod() { return period; }
    public String getDescription() { return description; }
    public List<String> getFeatures() { return features; }
    public boolean isPopular() { return popular; }
    public String getPriceId() { return priceId; }
}
