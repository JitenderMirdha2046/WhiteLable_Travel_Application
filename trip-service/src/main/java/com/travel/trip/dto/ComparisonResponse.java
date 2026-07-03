package com.travel.trip.dto;

import java.util.List;

public class ComparisonResponse {

    private String destination;
    private List<PlanDto> plans;

    public static class PlanDto {
        private String type;
        private String itinerary;

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getItinerary() { return itinerary; }
        public void setItinerary(String itinerary) { this.itinerary = itinerary; }
    }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }
    public List<PlanDto> getPlans() { return plans; }
    public void setPlans(List<PlanDto> plans) { this.plans = plans; }
}
