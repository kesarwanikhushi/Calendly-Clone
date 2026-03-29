
async function testPublicRoutes() {
  try {
    const baseUrl = 'http://localhost:5001/api/book';
    
    // 1. Test fetch event type by slug
    console.log("Testing fetch event by slug...");
    const res1 = await fetch(`${baseUrl}/types/quick-chat`);
    console.log("Status:", res1.status);
    if (res1.ok) {
      const data = await res1.json();
      console.log("Data slug:", data.slug);
    } else {
      console.log("Error response:", await res1.text());
    }

    // 2. Test fetch meeting by ID (using ID 2 from seed)
    console.log("\nTesting fetch meeting by ID...");
    const res2 = await fetch(`${baseUrl}/meetings/2`);
    console.log("Status:", res2.status);
    if (res2.ok) {
      const data = await res2.json();
      console.log("Meeting ID:", data.id);
      console.log("Invitee:", data.inviteeName);
    } else {
      console.log("Error response:", await res2.text());
    }
  } catch (err) {
    console.error("Fetch error:", err.message);
  }
}

testPublicRoutes();
