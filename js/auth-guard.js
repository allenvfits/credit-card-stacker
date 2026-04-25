async function requireLogin() {
  if (!window.supabaseClient) {
    alert("Supabase is not connected.");
    window.location.href = "auth.html";
    return null;
  }

  const { data, error } = await window.supabaseClient.auth.getUser();

  if (error || !data.user) {
    console.log("No logged-in user. Redirecting to auth.html");
    window.location.href = "auth.html";
    return null;
  }

  window.currentUser = data.user;
  console.log("Logged in user:", window.currentUser.email);
  return data.user;
}

async function signOutUser() {
  if (!window.supabaseClient) return;

  await window.supabaseClient.auth.signOut();
  localStorage.removeItem("creditCardStackerUserProfile");
  window.location.href = "auth.html";
}
