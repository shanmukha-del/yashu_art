/* =====================================================
   SUPABASE CLIENT SETUP
===================================================== */

const SUPABASE_URL = "https://kijfjkotchltfegwkevd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_N8FnT9y1rWIaHHPbbgOFwQ_3XQzGj5a";

// Initialize Client with window-safe check
let supabaseClient = null;
try {
  if (window.supabase) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  }
} catch (e) {
  console.error("Supabase initialization failed", e);
}

function getClient() {
    if (!supabaseClient) {
        console.error("Supabase client is not initialized.");
        return {
            from: () => ({ 
                select: () => ({ order: () => Promise.resolve({ data: [], error: { message: "Supabase not loaded" } }) }),
                insert: () => Promise.resolve({ error: { message: "Supabase not loaded" } }),
                delete: () => ({ eq: () => Promise.resolve({ error: { message: "Supabase not loaded" } }) }),
                update: () => ({ eq: () => Promise.resolve({ error: { message: "Supabase not loaded" } }) })
            }),
            auth: { 
                signInWithPassword: () => Promise.resolve({ error: { message: "Supabase not loaded" } }),
                signOut: () => Promise.resolve({}),
                getSession: () => Promise.resolve({ data: { session: null } })
            },
            storage: { from: () => ({ upload: () => Promise.resolve({ error: { message: "Supabase not loaded" } }), getPublicUrl: () => ({ data: { publicUrl: "" } }), remove: () => Promise.resolve({}) }) }
        };
    }
    return supabaseClient;
}

/* =====================================================
   ADMIN AUTH
===================================================== */

async function adminLogin(email, password) {
  const { error } = await getClient().auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alert("Login failed: " + error.message);
    return false;
  }
  return true;
}

async function adminLogout() {
  await getClient().auth.signOut();
}

async function checkAdminSession() {
  const { data } = await getClient().auth.getSession();
  return data.session !== null;
}

/* =====================================================
   STORAGE – UPLOAD IMAGE (CROP READY)
===================================================== */

async function uploadArtImage(file) {
  if (!file) {
    alert("No image file found");
    return null;
  }

  const safeName = file.name
    ? file.name.replace(/\s+/g, "_")
    : "cropped_image.png";

  const fileName = `art_${Date.now()}_${safeName}`;

  const { error } = await getClient().storage
    .from("arts-images")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false
    });

  if (error) {
    alert("Image upload failed: " + error.message);
    return null;
  }

  const { data } = getClient().storage
    .from("arts-images")
    .getPublicUrl(fileName);

  return data.publicUrl;
}

/* =====================================================
   DATABASE – ADD ART
===================================================== */

async function addArt(artName, artId, imageUrl) {
  const { error } = await getClient()
    .from("arts")
    .insert([{
      art_name: artName,
      art_id: artId,
      image_url: imageUrl
    }]);

  if (error) {
    alert("Database insert failed: " + error.message);
    return false;
  }
  return true;
}

/* =====================================================
   DATABASE – FETCH ALL ARTS
===================================================== */

async function fetchAllArts() {
  const { data, error } = await getClient()
    .from("arts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }
  return data;
}

/* =====================================================
   DATABASE + STORAGE – DELETE ART
===================================================== */

async function deleteArt(artId, imageUrl) {

  // Delete database record
  const { error } = await getClient()
    .from("arts")
    .delete()
    .eq("art_id", artId);

  if (error) {
    alert("Delete failed: " + error.message);
    return false;
  }

  // Delete image from storage
  if (imageUrl) {
    const fileName = imageUrl.split("/").pop();
    await getClient().storage
      .from("arts-images")
      .remove([fileName]);
  }

  return true;
}

/* =====================================================
   DATABASE – UPDATE ART (NAME + ID ONLY)
===================================================== */

async function updateArt(oldArtId, newName, newArtId) {
  const { error } = await getClient()
    .from("arts")
    .update({
      art_name: newName,
      art_id: newArtId
    })
    .eq("art_id", oldArtId);

  if (error) {
    alert("Update failed: " + error.message);
    return false;
  }
  return true;
}

/* =====================================================
   COMPLETE ADMIN SUBMIT FLOW (UPLOAD)
   👉 WORKS WITH NORMAL FILE OR CROPPED FILE
===================================================== */

async function submitArt(file, artName, artId) {

  const loggedIn = await checkAdminSession();
  if (!loggedIn) {
    alert("Admin not logged in");
    return false;
  }

  if (!file || !artName || !artId) {
    alert("All fields are mandatory");
    return false;
  }

  const imageUrl = await uploadArtImage(file);
  if (!imageUrl) return false;

  return await addArt(artName, artId, imageUrl);
}
