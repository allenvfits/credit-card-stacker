(function () {
  function mapDbCard(row) {
    return {
      id: row.id,
      name: row.name,
      issuer: row.issuer || "",
      balance: Number(row.balance || 0),
      limit: Number(row.credit_limit || 0),
      dueDate: row.due_date || "",
      statementDate: row.statement_date || "",
      createdAt: row.created_at || new Date().toISOString()
    };
  }

  async function getUserForCards() {
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

  window.loadCards = async function loadCards() {
    const user = await getUserForCards();
    if (!user) return;

    const { data, error } = await window.supabaseClient
      .from("cards")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      showToast("Could not load cards from Supabase.");
      cards = [];
      return;
    }

    cards = (data || []).map(mapDbCard);
  };

  window.saveCards = function saveCards() {
    console.log("Supabase mode: saveCards skipped because cards save directly to database.");
  };

  window.addCard = async function addCard() {
    const user = await getUserForCards();
    if (!user) return;

    const name = document.getElementById("cardName").value.trim();
    const balance = Number(document.getElementById("cardBalance").value);
    const limit = Number(document.getElementById("cardLimit").value);
    const dueDate = document.getElementById("dueDate").value || null;
    const statementDate = document.getElementById("statementDate").value || null;

    if (!name) {
      showToast("Add a card name first.");
      return;
    }

    if (!Number.isFinite(limit) || limit <= 0) {
      showToast("Credit limit must be higher than $0.");
      return;
    }

    const newCard = {
      user_id: user.id,
      name: name,
      balance: Number.isFinite(balance) ? Math.max(0, balance) : 0,
      credit_limit: Math.max(1, limit),
      due_date: dueDate,
      statement_date: statementDate
    };

    const { data, error } = await window.supabaseClient
      .from("cards")
      .insert(newCard)
      .select()
      .single();

    if (error) {
      console.error(error);
      showToast("Could not save card to Supabase.");
      return;
    }

    cards.unshift(mapDbCard(data));
    closeCardModal();
    renderAll();
    showToast("Card saved to your Supabase account.");
  };

  window.deleteCard = async function deleteCard(id) {
    const user = await getUserForCards();
    if (!user) return;

    const { error } = await window.supabaseClient
      .from("cards")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error(error);
      showToast("Could not delete card.");
      return;
    }

    cards = cards.filter(card => card.id !== id);
    renderAll();
    showToast("Card removed from Supabase.");
  };

  window.markPaidToGoal = async function markPaidToGoal(id) {
    const user = await getUserForCards();
    if (!user) return;

    const goal = Number(document.getElementById("goal").value);
    const card = cards.find(item => item.id === id);
    if (!card) return;

    const target = Math.floor(card.limit * (goal / 100));
    const nextBalance = Math.min(card.balance, target);

    const { error } = await window.supabaseClient
      .from("cards")
      .update({ balance: nextBalance })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error(error);
      showToast("Could not update card.");
      return;
    }

    cards = cards.map(item => item.id === id ? { ...item, balance: nextBalance } : item);
    renderAll();
    showToast("Balance adjusted in Supabase.");
  };

  window.updateBalancePrompt = async function updateBalancePrompt(id) {
    const user = await getUserForCards();
    if (!user) return;

    const card = cards.find(item => item.id === id);
    if (!card) return;

    const next = prompt("Enter new balance:", String(card.balance));
    if (next === null) return;

    const value = Number(next);

    if (!Number.isFinite(value) || value < 0) {
      showToast("Enter a valid balance.");
      return;
    }

    const { error } = await window.supabaseClient
      .from("cards")
      .update({ balance: value })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error(error);
      showToast("Could not update balance.");
      return;
    }

    cards = cards.map(item => item.id === id ? { ...item, balance: value } : item);
    renderAll();
    showToast("Balance updated in Supabase.");
  };

  window.loadSampleCards = async function loadSampleCards() {
    const user = await getUserForCards();
    if (!user) return;

    const sampleCards = [
      {
        user_id: user.id,
        name: "Capital One Secured",
        balance: 238,
        credit_limit: 500,
        due_date: "2026-05-18",
        statement_date: "2026-05-04"
      },
      {
        user_id: user.id,
        name: "Starter Rewards Card",
        balance: 84,
        credit_limit: 1000,
        due_date: "2026-05-25",
        statement_date: "2026-05-11"
      },
      {
        user_id: user.id,
        name: "Store Card",
        balance: 390,
        credit_limit: 700,
        due_date: "2026-05-29",
        statement_date: "2026-05-16"
      }
    ];

    const { data, error } = await window.supabaseClient
      .from("cards")
      .insert(sampleCards)
      .select();

    if (error) {
      console.error(error);
      showToast("Could not load sample cards into Supabase.");
      return;
    }

    cards = [...(data || []).map(mapDbCard), ...cards];
    renderAll();
    showToast("Sample cards saved to Supabase.");
  };

  async function initSupabaseCards() {
    await window.loadCards();
    renderAll();
    console.log("Dashboard cards loaded from Supabase.");
  }

  window.addEventListener("load", function () {
    setTimeout(initSupabaseCards, 400);
  });
})();
