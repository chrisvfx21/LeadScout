import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function extractCityState(address) {
  if (!address) return "";
  const parts = address.split(",").map((p) => p.trim());
  // Typical format: [street, city, "STATE zip", "USA"]
  if (parts.length >= 3) {
    const city = parts[1];
    const stateZip = parts[2].split(" ")[0]; // just the state abbreviation
    return `${city}, ${stateZip}`;
  }
  return address;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { category, area } = await req.json();
    const apiKey = Deno.env.get("GOOGLE_PLACES_API_KEY");

    const query = `${category} in ${area}`;
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    const businesses = (data.results || []).map((place) => ({
      name: place.name,
      area: extractCityState(place.formatted_address),
      rating: place.rating || null,
      reviews: place.user_ratings_total || 0,
      has_website: false, // Text Search doesn't return website; we'll refine this next
      category,
      google_place_id: place.place_id,
    }));

    return new Response(JSON.stringify({ businesses }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});