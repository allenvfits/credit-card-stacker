(function () {
  async function getUserForProfile() {
    if (!window.supabaseClient) {
      showToast("Supabase is not connected.");
      return null;
    }

    const { data, error } = await window.supabaseClient.auth.getUser();

    if (error || !data.user) {
      showToast("Please sign in first.");
      window.location.href = "auth.html";
      return null;
    }

    window.currentUser = data.user;
    return data.user;
  }

  function getProfileFormValues() {
    return {
      score_range: document.getElementById("scoreRange")?.value || "580-619",
      income_range: document.getElementById("incomeRange")?.value || "$25k–$49k",
      inquiries: document.getElementById("inquiries")?.value || "1–2",
      goal: document.getElementById("goal")?.value || "10",
      main_goal: "lower-utilization"
    };
  }

  function setProfileFormValues(profile) {
    if (!profile) return;

    const scoreRange = document.getElementById("scoreRange");
    const incomeRange = document.getElementById("incomeRange");
    const inquiries = document.getElementById("inquiries");
    const goal = document.getElementById("goal");

    if (scoreRange && profile.score_range) scoreRange.value = profile.score_range;
    if (incomeRange && profile.income_range) incomeRange.value = profile.income_range;
    if (inquiries && profile.inquiries) inquiries.value = profile.inquiries;
    if (goal && profile.goal) goal.value = profile.goal;
  }

  window.loadSettings = async function loadSettings() {
    const user = await getUserForProfile();
    if (!user) return;

    const { data, error } = await window.supabaseClient
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.warn("Profile not found yet. Creating profile row.", error.message);

      const fallbackProfile = {
        user_id: user.id,
        email: user.email,
        display_name: user.user_metadata?.display_name || user.email?.split("@")[0] || "User",
        score_range: "580-619",
        income_range: "$25k–$49k",
        inquiries: "1–2",
        goal: "10",
        main_goal: "lower-utilization"
      };

      const { data: created, error: createError } = await window.supabaseClient
        .from("profiles")
        .upsert(fallbackProfile, { onConflict: "user_id" })
        .select()
        .single();

      if (createError) {
        console.error(createError);
        showToast("Could not create profile settings.");
        return;
      }

      setProfileFormValues(created);
      renderAll();
      return;
    }

    setProfileFormValues(data);
    renderAll();
    console.log("Profile settings loaded from Supabase.");
  };

  window.saveSettings = async function saveSettings() {
    const user = await getUserForProfile();
    if (!user) return;

    const values = getProfileFormValues();

    const profileUpdate = {
      user_id: user.id,
      email: user.email,
      display_name: user.user_metadata?.display_name || user.email?.split("@")[0] || "User",
      score_range: values.score_range,
      income_range: values.income_range,
      inquiries: values.inquiries,
      goal: values.goal,
      main_goal: values.main_goal,
      updated_at: new Date().toISOString()
    };

    const { error } = await window.supabaseClient
      .from("profiles")
      .upsert(profileUpdate, { onConflict: "user_id" });

    if (error) {
      console.error(error);
      showToast("Could not save profile settings.");
      return;
    }

    localStorage.setItem("creditCardStackerSettings", JSON.stringify({
      scoreRange: values.score_range,
      incomeRange: values.income_range,
      inquiries: values.inquiries,
      goal: values.goal
    }));

    renderAll();
    showToast("Profile settings saved to Supabase.");
  };

  async function initSupabaseProfile() {
    await window.loadSettings();
  }

  window.addEventListener("load", function () {
    setTimeout(initSupabaseProfile, 500);
  });
})();
