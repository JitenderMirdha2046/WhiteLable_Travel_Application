package com.travel.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.reactive.JdkClientHttpConnector;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.net.http.HttpClient;
import java.util.Map;

@Service
public class GeminiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);
    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;

    public GeminiService(@Value("${gemini.api.key}") String apiKey,
                         @Value("${gemini.api.url}") String apiUrl) {
        this.apiKey = apiKey;
        this.webClient = WebClient.builder()
                .baseUrl(apiUrl)
                .clientConnector(new JdkClientHttpConnector(HttpClient.newBuilder()
                        .connectTimeout(java.time.Duration.ofSeconds(10))
                        .build()))
                .build();
        this.objectMapper = new ObjectMapper();
        log.info("GeminiService initialized with API key: {}...", apiKey.length() > 10 ? apiKey.substring(0, 10) : "short");
    }

    public String generateItinerary(String destination, String travelType, int days,
                                    String moodDescription, boolean isReplan, String instruction) {
        if ("placeholder-key".equals(apiKey)) {
            return generateFallbackItinerary(destination, travelType, days, moodDescription);
        }

        StringBuilder prompt = new StringBuilder();
        prompt.append("Create a detailed ").append(days).append("-day travel itinerary for ")
              .append(destination).append(". Travel type: ").append(travelType).append(".");

        if (moodDescription != null && !moodDescription.isBlank()) {
            prompt.append(" Mood/Vibe: ").append(moodDescription).append(".");
        }

        if (isReplan && instruction != null) {
            prompt.append(" Modify the previous plan: ").append(instruction).append(".");
        }

        prompt.append(" CRITICAL: You MUST mention SPECIFIC landmark names, temple names, fort names, museum names, market names, and restaurant names that actually exist in ")
              .append(destination).append(". DO NOT use generic phrases like 'Visit main attractions' or 'Explore nearby markets'. Instead say things like 'Visit Hawa Mahal', 'Explore Johari Bazaar', 'Eat at Laxmi Mishthan Bhandar'. Be extremely specific with real place names. Include estimated costs per day.");

        try {
            Map<String, Object> requestBody = Map.of(
                "contents", new Object[]{
                    Map.of("parts", new Object[]{
                        Map.of("text", prompt.toString())
                    })
                }
            );

            String response = webClient.post()
                    .uri("?key=" + apiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode root = objectMapper.readTree(response);
            JsonNode text = root.path("candidates").get(0)
                               .path("content").path("parts").get(0).path("text");
            return text.asText();
        } catch (Exception e) {
            log.error("Gemini API call failed: {} - {}: {}", e.getClass().getSimpleName(), e.getMessage(),
                      e.getCause() != null ? e.getCause().getMessage() : "");
            return generateFallbackItinerary(destination, travelType, days, moodDescription);
        }
    }

    public String analyzeMood(String moodDescription) {
        if ("placeholder-key".equals(apiKey)) {
            return getFallbackMoodAnalysis(moodDescription);
        }
        try {
            String prompt = "Analyze the following travel mood/vibe preference: '" + moodDescription
                    + "'. Suggest destinations, activities, and travel style that match.";

            Map<String, Object> requestBody = Map.of(
                "contents", new Object[]{
                    Map.of("parts", new Object[]{
                        Map.of("text", prompt)
                    })
                }
            );

            String response = webClient.post()
                    .uri("?key=" + apiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode root = objectMapper.readTree(response);
            JsonNode text = root.path("candidates").get(0)
                               .path("content").path("parts").get(0).path("text");
            return text.asText();
        } catch (Exception e) {
            return getFallbackMoodAnalysis(moodDescription);
        }
    }

    public String compareDestinations(String destination) {
        if ("placeholder-key".equals(apiKey)) {
            return getFallbackComparison(destination);
        }
        try {
            String prompt = "Compare different travel approaches for a trip to " + destination
                    + ". Provide 3 distinct itinerary options: budget-friendly, luxury, and adventure-focused.";

            Map<String, Object> requestBody = Map.of(
                "contents", new Object[]{
                    Map.of("parts", new Object[]{
                        Map.of("text", prompt)
                    })
                }
            );

            String response = webClient.post()
                    .uri("?key=" + apiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode root = objectMapper.readTree(response);
            JsonNode text = root.path("candidates").get(0)
                               .path("content").path("parts").get(0).path("text");
            return text.asText();
        } catch (Exception e) {
            return getFallbackComparison(destination);
        }
    }

    private String generateFallbackItinerary(String destination, String travelType, int days,
                                              String moodDescription) {
        StringBuilder sb = new StringBuilder();
        String[][] dayActivities = getLandmarksForDestination(destination);
        if (dayActivities == null) {
            dayActivities = defaultDayActivities();
        }
        String[] meals = {"Breakfast at local café", "Lunch at a popular restaurant", "Dinner at a highly-rated eatery"};

        for (int i = 0; i < days && i < dayActivities.length; i++) {
            String[] today = dayActivities[i];
            sb.append("Day ").append(i + 1).append(" — ").append(today[0]).append("\n");
            sb.append("Morning: ").append(today[0]).append("\n");
            sb.append("Afternoon: ").append(today[1]).append("\n");
            sb.append("Evening: ").append(today[2]).append("\n");
            sb.append(meals[i % 3]).append("\n\n");
        }

        sb.append("Total Estimated Cost: ₹").append(days * 5000).append("\n");
        sb.append("Travel Type: ").append(travelType).append("\n");
        if (moodDescription != null && !moodDescription.isBlank()) {
            sb.append("Mood/Vibe: ").append(moodDescription).append("\n");
        }
        sb.append("Destination: ").append(destination).append("\n");

        return sb.toString();
    }

    private String[][] getLandmarksForDestination(String dest) {
        if (dest == null) return null;
        return switch (dest.toLowerCase().trim()) {
            case "jaipur" -> new String[][]{
                {"Visit Amber Fort & Palace", "Explore Hawa Mahal & Jantar Mantar", "Evening at Johari Bazaar — jewelry market"},
                {"City Palace & Museum tour", "Lunch at Laxmi Mishthan Bhandar", "Sunset at Nahargarh Fort"},
                {"Birla Mandir & Albert Hall Museum", "Shopping at Bapu Bazaar", "Chokhi Dhani cultural show & Rajasthani dinner"},
                {"Jaigarh Fort & Jal Mahal", "Block printing workshop in Sanganer", "Traditional puppet show & Rajasthani thali"},
                {"Galtaji Temple (Monkey Temple)", "Sisodia Rani Garden & Palace", "Farewell dinner at 1135 AD restaurant"},
            };
            case "goa" -> new String[][]{
                {"Baga Beach & watersports", "Explore Anjuna Flea Market", "Sunset at Chapora Fort"},
                {"Basilica of Bom Jesus & Old Goa", "Lunch at Fisherman's Wharf", "Titos Lane nightlife"},
                {"Dudhsagar Falls trek", "Spice plantation tour", "Portuguese-style dinner at Mum's Kitchen"},
                {"Palolem Beach kayaking", "Butterfly Beach boat ride", "Seafood dinner at Martin's Corner"},
                {"Fort Aguada & Candolim Beach", "Museum of Christian Art", "Farewell sunset cruise on Mandovi River"},
            };
            case "manali" -> new String[][]{
                {"Hadimba Devi Temple", "Explore Mall Road & Tibetan Monastery", "Old Manali cafe hopping"},
                {"Solang Valley — paragliding & zorbing", "Lunch at The Johnson's Cafe", "Hot springs at Vashisht"},
                {"Rohtang Pass day trip", "Snow activities & photography", "Bonfire dinner at riverside camp"},
                {"Manu Temple & Van Vihar", "River rafting in Beas", "Shopping for Kullu shawls on Mall Road"},
                {"Jogini Falls trek", "Visit Club House", "Farewell dinner at Cafe 1947"},
            };
            case "kerala" -> new String[][]{
                {"Arrive in Kochi — Fort Kochi walk", "Chinese fishing nets & Mattancherry Palace", "Kathakali dance performance"},
                {"Munnar tea plantation tour", "Tea museum & Eravikulam National Park", "Sunset at Top Station"},
                {"Alleppey houseboat check-in", "Backwater cruise through paddy fields", "Traditional Kerala dinner onboard"},
                {"Alleppey beach & lighthouse", "Kumarakom bird sanctuary", "Ayurvedic spa treatment"},
                {"Varkala cliff walk", "Papanasam Beach", "Farewell seafood dinner at Varkala"},
            };
            case "ladakh" -> new String[][]{
                {"Leh Palace & Shanti Stupa", "Magnetic Hill & Sangam (Indus-Zanskar)", "Evening at Leh Bazaar"},
                {"Nubra Valley via Khardung La Pass", "Sand dunes & double-humped camel ride", "Overnight camp in Nubra"},
                {"Pangong Lake day trip", "Enjoy the breathtaking blue water", "Return to Leh — dinner at Tibetan Kitchen"},
                {"Tso Moriri Lake drive", "Explore Shey Palace & Thiksey Monastery", "Stargazing in the cold desert"},
                {"Lamayuru & Alchi Monastery", "Basgo Fort on return", "Farewell dinner in Leh"},
            };
            case "udaipur" -> new String[][]{
                {"City Palace tour", "Jagdish Temple & Gangaur Ghat", "Sunset boat ride on Lake Pichola"},
                {"Kumbhalgarh Fort day trip", "Kumbhalgarh Wildlife Sanctuary", "Return to Udaipur — dinner at Ambrai"},
                {"Saheliyon-ki-Bari & Fateh Sagar Lake", "Lunch at Jheel's Rooftop", "Bagore-ki-Haveli cultural show"},
                {"Ranakpur Jain Temple", "Haldighati & Chittorgarh on the way", "Evening walk at the Lake Palace"},
                {"Monsoon Palace (Sajjangarh)", "Local miniature painting workshop", "Farewell dinner with lake view"},
            };
            case "agra" -> new String[][]{
                {"Taj Mahal sunrise visit", "Agra Fort", "Lunch at Pinch of Spice"},
                {"Mehtab Bagh for Taj sunset view", "Itimad-ud-Daulah (Baby Taj)", "Evening at Sadar Bazaar"},
                {"Fatehpur Sikri day trip", "Buland Darwaza & Jama Masjid", "Return to Agra — Mughlai dinner"},
                {"Akbar's Tomb in Sikandra", "Marble inlay workshop visit", "Sound & Light show at Agra Fort"},
                {"Local sweet shopping (petha)", "Wildlife SOS bear rescue center", "Farewell dinner at Dal Mughlai"},
            };
            case "varanasi" -> new String[][]{
                {"Ganga Aarti at Dashashwamedh Ghat", "Explore narrow lanes of old city", "Boat ride on Ganges at sunset"},
                {"Kashi Vishwanath Temple darshan", "Sarnath — Buddha's first sermon site", "Evening aarti again — different ghat"},
                {"Assi Ghat morning yoga", "Banaras Hindu University & Bharat Kala Bhavan", "Silk weaving center visit"},
                {"Ramnagar Fort tour", "Tulsi Manas Temple & Durga Temple", "Dinner at Kashi Chat Bhandar"},
                {"Ganga river cruise at dawn", "Shopping for Banarasi silk", "Farewell dinner and departure"},
            };
            default -> null;
        };
    }

    private String[][] defaultDayActivities() {
        return new String[][]{
            {"Arrival and city orientation walk", "Local landmark visit & market", "Welcome dinner at popular restaurant"},
            {"Major temple or fort visit", "Local cuisine tasting tour", "Cultural show or sound & light show"},
            {"Nature walk or scenic viewpoint", "Museum or heritage site", "Sunset at best viewpoint in city"},
            {"Day trip to nearby attraction", "Lunch at a famous local eatery", "Evening stroll through main market"},
            {"Outdoor adventure activity", "Wellness or spa experience", "Farewell dinner at rooftop restaurant"},
            {"Photography tour of old city", "Artisan workshop or craft demo", "Night market exploration"},
            {"Scenic drive to viewpoint", "Vineyard or farm visit", "Bonfire dinner experience"},
            {"Wellness morning — yoga or spa", "Boat ride or water activity", "Traditional music night dinner"},
            {"Heritage walk through old quarter", "Cooking class with local family", "Stargazing session"},
            {"Departure preparation & souvenir shopping", "Last-minute landmark visit", "Check-out and departure"},
        };
    }

    private String[] getActivitiesForType(String travelType) {
        if (travelType == null) travelType = "";
        return switch (travelType.toLowerCase()) {
            case "adventure" -> new String[]{"Trekking", "Rock climbing", "River rafting", "Zip-lining", "Camping", "Mountain biking"};
            case "relaxation" -> new String[]{"Spa treatment", "Beach lounging", "Yoga session", "Meditation", "Poolside reading", "Scenic cruise"};
            case "cultural" -> new String[]{"Temple visit", "Museum tour", "Heritage walk", "Folk dance show", "Craft workshop", "Cooking class"};
            case "road trip" -> new String[]{"Scenic drive", "Roadside attraction stop", "Local diner lunch", "Viewpoint photo stop", "Night drive", "Gas station break"};
            case "beach" -> new String[]{"Swimming", "Snorkeling", "Beach volleyball", "Sunbathing", "Jet skiing", "Sunset walk"};
            case "wildlife" -> new String[]{"Safari drive", "Bird watching", "Nature trek", "Animal sanctuary visit", "Photography session", "Night trail"};
            case "family" -> new String[]{"Amusement park", "Kid-friendly museum", "Picnic", "Boat ride", "Aquarium visit", "Family dinner"};
            case "solo" -> new String[]{"Personal exploration", "Photography walk", "Solo dining experience", "Journaling spot", "Local class", "Meetup event"};
            default -> new String[]{"City tour", "Market visit", "Landmark sightseeing", "Local cuisine tasting", "Shopping", "Evening stroll"};
        };
    }

    private String getFallbackMoodAnalysis(String moodDescription) {
        return "Based on your mood '" + moodDescription + "', we recommend:\n"
             + "- Relaxed beach destinations with spa facilities\n"
             + "- Nature walks and scenic viewpoints\n"
             + "- Fine dining experiences\n"
             + "- Cultural tours and museum visits";
    }

    private String getFallbackComparison(String destination) {
        return "=== Budget-Friendly Plan ===\n"
             + "- Stay in hostels or budget hotels\n"
             + "- Use public transportation\n"
             + "- Street food and local eateries\n"
             + "- Free walking tours\n\n"
             + "=== Luxury Plan ===\n"
             + "- 5-star hotel with premium amenities\n"
             + "- Private transfers and tours\n"
             + "- Fine dining at top restaurants\n"
             + "- VIP experiences and spa\n\n"
             + "=== Adventure Plan ===\n"
             + "- Eco-lodges and camping\n"
             + "- Hiking, biking, water sports\n"
             + "- Local food adventures\n"
             + "- Off-the-beaten-path exploration";
    }
}
