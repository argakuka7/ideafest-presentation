/* IDEATALKS SUB 2027 — mockup app: state, render, dan interaksi. */
(() => {
  "use strict";

  const D = window.IDEAFEST;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const initials = (n) => n.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  // ---------- track warna ----------
  const TRACKS = {
    Bisnis: ["var(--tr-b)", "var(--tr-bg-b)", "var(--tr-tx-b)"],
    FnB: ["var(--tr-f)", "var(--tr-bg-f)", "var(--tr-tx-f)"],
    "Art & Culture": ["var(--tr-a)", "var(--tr-bg-a)", "var(--tr-tx-a)"],
    Content: ["var(--tr-c)", "var(--tr-bg-c)", "var(--tr-tx-c)"],
    Teknologi: ["var(--tr-t)", "var(--tr-bg-t)", "var(--tr-tx-t)"],
    "Self Development": ["var(--tr-s)", "var(--tr-bg-s)", "var(--tr-tx-s)"],
    "Mental Health": ["var(--tr-m)", "var(--tr-bg-m)", "var(--tr-tx-m)"],
    "Policy Making": ["var(--tr-p)", "var(--tr-bg-p)", "var(--tr-tx-p)"],
  };
  const tg = (track) => {
    const t = TRACKS[track] ?? TRACKS.Bisnis;
    return `background:${t[1]};color:${t[2]}`;
  };

  // ---------- state ----------
  const S = {
    user: { name: "Raka", email: "", role: "Founder", interests: ["Bisnis", "Teknologi"], ticket: "" },
    saved: new Set(),
    follow: new Set(),
    day: 1,
    trackFilter: "Semua",
    q: "",
    view: "home",
    chat: [],
    onbStep: 1,
    onbInterests: new Set(),
    onbRole: null,
  };

  const allSessions = () => D.days.flatMap((d) => d.sessions);
  const dayOf = (n) => D.days.find((d) => d.day === n) ?? D.days[0];
  const fmtDate = (iso) => {
    const dt = new Date(iso + "T00:00:00");
    return dt.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };
  const sessionById = (id) => allSessions().find((s) => s.id === id);

  // ---------- rekomendasi (mesin aturan,_DEPTH-3) ----------
  function recommend(n = 4) {
    const scored = allSessions().map((s) => {
      let score = 0;
      const reasons = [];
      if (S.user.interests.includes(s.track)) { score += 10; reasons.push(s.track); }
      if (s.speakers.some((sp) => /Founder|CEO|Creative|Content|Marketing/.test(sp.role || ""))) score += 3;
      if (s.title.length > 40 && s.title.length < 80) score += 1;
      if (/awal|first|Awal/.test(s.title)) score += 1;
      return { s, score, reasons };
    });
    const top = scored.sort((a, b) => b.score - a.score);
    const out = [];
    const usedTime = new Set();
    for (const item of top) {
      if (out.length >= n) break;
      const key = item.s.day + "|" + item.s.time;
      if (usedTime.has(key)) continue;
      usedTime.add(key);
      out.push(item);
    }
    return out;
  }

  function reasonFor(s) {
    const map = {
      Bisnis: "kamu sedang bangun produk pertama — sesi ini soal harga dan pasar lokal, bukan teori dari luar.",
      Teknologi: "budgetmu tipis — di sini mereka membahas tools ringan yang benar dipakai UMKM, bukan tool mahal.",
      Content: "produk baru butuh orang yang tahu; ini bagian paling dekat sama cara menjual lewat cerita.",
      "Art & Culture": "kamu bilang suka yang visual, dan ini satu-satunya sesi soal cerita jadi karakter.",
      FnB: "bisa jadi bonus, tapi paling masuk akal: cara membangun brand F&B lokal yang bertahan.",
      "Self Development": "buat Bagian yang merasa jalan terlalu cepat, sesi ini soal langkah yang bisa diulang.",
      "Mental Health": "burnout itu mahal — di sini dibicarakan terbuka, bukan sebagai jargon.",
      "Policy Making": "kalau produkmu nanti kena aturan, ini yang perlu kamu tahu duluan.",
    };
    return map[s.track] ?? "sesi ini cocok dengan minatmu.";
  }

  // ---------- konteks global: jam acara & sesi yang sedang jalan ----------
  const NOW_MIN = 10 * 60 + 42; // jam acara saat ini (mockup)
  const toMin = (hhmm) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));
  function currentDay() { return dayOf(S.day); }
  function liveSession() {
    const d = currentDay();
    return d.sessions.find((s) => toMin(s.timeStart) <= NOW_MIN && NOW_MIN < toMin(s.timeEnd)) ?? null;
  }
  function nextSession() {
    const d = currentDay();
    return d.sessions.find((s) => toMin(s.timeStart) > NOW_MIN) ?? null;
  }

  function renderCtx() {
    const titles = { home: "Beranda", schedule: "Jadwal lengkap", saved: "Tersimpan", speakers: "Pembicara", profile: "Profil", chat: "Mira", session: "Detail sesi", speaker: "Detail pembicara" };
    $("#cb-title").textContent = titles[S.view] ?? "IDEATALKS";
    const live = liveSession();
    const next = nextSession();
    if (S.view === "saved") {
      const n = S.saved.size;
      $("#cb-sub").textContent = n ? `${n} sesi tersimpan` : "Belum ada sesi tersimpan";
      $("#cb-day").textContent = "Day " + S.day;
      const hh = String(Math.floor(NOW_MIN / 60)).padStart(2, "0");
      const mm = String(NOW_MIN % 60).padStart(2, "0");
      $("#cb-clock").textContent = `${hh}.${mm}`;
      return;
    }
    $("#cb-sub").textContent = live
      ? `Sedang berlangsung: ${live.title}`
      : next
        ? `Berikutnya ${next.timeStart}: ${next.title}`
        : "Hari ini sudah selesai";
    $("#cb-day").textContent = "Day " + S.day;
    const hh = String(Math.floor(NOW_MIN / 60)).padStart(2, "0");
    const mm = String(NOW_MIN % 60).padStart(2, "0");
    $("#cb-clock").textContent = `${hh}.${mm}`;
  }

  // ---------- strip "sedang berlangsung" ----------
  function renderNowStrip() {
    const live = liveSession();
    const next = nextSession();
    const el = $("#nowstrip");
    if (!live) {
      el.innerHTML = next
        ? `<span class="live" style="background:#F59E0B;box-shadow:0 0 0 4px rgba(245,158,11,.16)"></span>
           <div class="txt"><b>Belum ada yang jalan</b><small>Berikutnya ${esc(next.timeStart)} · ${esc(next.title)}</small></div>
           <button class="go" data-sess="${next.id}">Lihat →</button>`
        : `<span class="live" style="background:#6B7280;box-shadow:none"></span>
           <div class="txt"><b>Hari ini sudah selesai</b><small>Besok masih ada ${dayOf(S.day === 3 ? 1 : S.day + 1).sessions.length} sesi.</small></div>`;
      return;
    }
    el.innerHTML = `<span class="live"></span>
      <div class="txt"><b>${esc(live.title)}</b><small>${live.time} · ${esc(live.room)} · ${esc((live.speakers[0] ?? {}).name || "")}</small></div>
      <button class="go" data-sess="${live.id}">Lihat →</button>`;
  }

  // ---------- konflik jadwal ----------
  function findConflicts() {
    const list = allSessions().filter((s) => S.saved.has(s.id));
    const out = [];
    list.forEach((a, i) => {
      list.slice(i + 1).forEach((b) => {
        if (a.day !== b.day) return;
        const overlap = toMin(a.timeStart) < toMin(b.timeEnd) && toMin(b.timeStart) < toMin(a.timeEnd);
        if (overlap) out.push([a, b]);
      });
    });
    return out;
  }
  function renderConflicts() {
    const c = findConflicts();
    const box = $("#conflicts");
    if (!c.length) { box.hidden = true; return; }
    box.hidden = false;
    box.innerHTML = `<b>${c.length} bentrok di jadwalmu</b><p>${c.slice(0, 2).map(([a, b]) => `<b>${esc(a.title)}</b> dan <b>${esc(b.title)}</b> (${a.time})`).join("; ")}. Pilih salah satu agar tidak saling tabrakan.</p>`;
  }

  // ---------- ekspor kalender (.ics) ----------
  function buildIcs() {
    const list = allSessions().filter((s) => S.saved.has(s.id));
    const stamp = (d, t) => d.replace(/-/g, "") + "T" + t.replace(":", "") + "00";
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//IDEATALKS SUB//Jadwal//ID", "CALSCALE:GREGORIAN"];
    list.forEach((s) => {
      const d = dayOf(s.day).date;
      lines.push("BEGIN:VEVENT", `UID:${s.id}@ideafest`, `DTSTAMP:${stamp(d, "00:00")}Z`,
        `DTSTART:${stamp(d, s.timeStart)}`, `DTEND:${stamp(d, s.timeEnd)}`,
        `SUMMARY:${s.title.replace(/,/g, "\\,")}`,
        `LOCATION:${s.room.replace(/,/g, "\\,")}`,
        `DESCRIPTION:${(s.speakers.map((x) => x.name).join(", ") || "IDEATALKS SUB").replace(/,/g, "\\,")}`,
        "END:VEVENT");
    });
    lines.push("END:VCALENDAR");
    return lines.join("\r\n");
  }
  function exportIcs() {
    const blob = new Blob([buildIcs()], { type: "text/calendar;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ideafest-jadwalmu.ics";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 3000);
  }
  async function shareSchedule() {
    const list = allSessions().filter((s) => S.saved.has(s.id));
    const text = "Jadwal IDEATALKS SUB-ku:\n" + list.map((s) => `• ${s.time} · ${s.title} (${s.room})`).join("\n");
    if (navigator.share) { try { await navigator.share({ title: "Jadwal IDEATALKS SUB", text }); return; } catch {} }
    try { await navigator.clipboard.writeText(text); notify("Jadwalmu disalin ke clipboard."); } catch { notify("Tidak bisa menyalin otomatis."); }
  }
  function notify(msg) {
    let el = $("#toast");
    if (!el) { el = document.createElement("div"); el.id = "toast"; document.body.appendChild(el); }
    el.textContent = msg;
    el.classList.add("on");
    setTimeout(() => el.classList.remove("on"), 2600);
  }

  // ---------- render: beranda ----------
  function renderHome() {
    $("#home-name").textContent = S.user.name.split(" ")[0] || "Raka";
    const recs = recommend(4);
    $("#home-count").textContent = recs.length + " sesi";
    $("#home-lede").textContent = `Kamu bilang mau-${S.user.role === "Student" ? "belajar" : "ngeluarin produk"} baru tahun ini. Aku susun jalannya dari ${allSessions().length} sesi yang ada.`;

    // hari
    const daysHtml = D.days.map((d) => `<button class="day${d.day === S.day ? " on" : ""}" data-day="${d.day}"><b>DAY ${d.day}</b><span>${fmtDate(d.date)}</span></button>`).join("");
    $("#day-tabs").innerHTML = daysHtml;
    $("#day-tabs2").innerHTML = daysHtml;

    // peta
    const day = dayOf(S.day);
    const stops = day.sessions.slice(0, 5);
    $("#day-map").innerHTML = `
      <div class="lbl">Peta harimu</div>
      <h2>${stops.length ? "Rapat bisa merapat." : "Belum ada sesi hari ini."}</h2>
      <p>${stops.length ? stops.length + " sesi teratas di hari ini. Jeda 10 menit, satu ruangan, tightrope." : "Coba ganti hari di atas."}</p>
      <div class="rail">
        <div class="rail-line"></div>
        <div class="rail-fill" style="width:${Math.max(6, (stops.filter((_, i) => i % 2 === 0).length / Math.max(1, stops.length)) * 88)}%"></div>
        <div class="stops">${stops.map((s, i) => `<div class="stop${i % 2 === 0 ? " on" : ""}"><i></i><b>${s.timeStart}</b></div>`).join("")}</div>
      </div>`;

    // rekomendasi
    $("#home-recs").innerHTML = recs.map(({ s }) => {
      const sp = s.speakers[0] ?? { name: "—", role: "" };
      const on = S.saved.has(s.id);
      return `<div class="pick" data-sess="${s.id}">
        <div class="meta"><em style="${tg(s.track)}">${esc(s.track)}</em><span>${s.time}</span><span>·</span><span>${esc(s.roomShort)}</span></div>
        <h4>${esc(s.title)}</h4>
        <div class="spk"><i>${esc(initials(sp.name))}</i><span>${esc(sp.name)}<small>${esc(sp.role)}</small></span></div>
        <div class="why">${esc(reasonFor(s))}</div>
        <div class="save"><button class="btn-save${on ? " done" : ""}" data-save="${s.id}">${on ? "Tersimpan ✓" : "Simpan ke jadwal"}</button></div>
      </div>`;
    }).join("");

    // catatan Mira
    $("#mira-note").innerHTML = `<div class="mira-av sm">M</div><p><b>Halo ${esc(S.user.name.split(" ")[0])}.</b> Aku pilih ${recs.length} sesi yang paling cocok dengan minatmu. Kalau berubah pikiran, tap minat di Profil — aku susun ulang.</p>`;

    renderNowStrip();
    renderCtx();
  }

  // ---------- render: jadwal ----------
  function renderSchedule() {
    const tracks = ["Semua", ...D.tracks];
    $("#track-filters").innerHTML = tracks.map((t) => `<button class="fchip${S.trackFilter === t ? " on" : ""}" data-track="${esc(t)}">${esc(t)}</button>`).join("");

    const q = S.q.toLowerCase();
    const groups = D.days.map((d) => {
      let list = d.sessions.filter((s) => {
        if (S.trackFilter !== "Semua" && s.track !== S.trackFilter) return false;
        if (!q) return true;
        return s.title.toLowerCase().includes(q) || s.speakers.some((sp) => sp.name.toLowerCase().includes(q)) || (s.room || "").toLowerCase().includes(q);
      });
      if (!list.length) return "";
      return `<div class="dayhead"><b>DAY ${d.day}</b><span>${fmtDate(d.date)} · ${list.length} sesi</span></div>` + list.map((s) => {
        const on = S.saved.has(s.id);
        const sp = s.speakers.map((x) => x.name).join(", ");
        return `<button class="srow" data-sess="${s.id}">
          <div class="tm">${s.timeStart}<small>${s.timeEnd}</small></div>
          <div class="bd">
            <span class="tg" style="${tg(s.track)}">${esc(s.track)}</span>
            <h4>${esc(s.title)}</h4>
            <div class="who">${esc(sp)}</div>
            <div class="rm">${esc(s.room)}</div>
          </div>
          <div class="sv${on ? " on" : ""}" data-save="${s.id}" role="button" aria-label="Simpan sesi">
            <svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
          </div>
        </button>`;
      }).join("");
    }).join("");

    $("#session-list").innerHTML = groups || `<div class="empty"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg><p>Tidak ada sesi yang cocok dengan filter itu.</p></div>`;
  }

  // ---------- render: tersimpan ----------
  function renderSaved() {
    const list = allSessions().filter((s) => S.saved.has(s.id));
    $("#saved-count").textContent = list.length + " sesi tersimpan.";
    $("#saved-badge").textContent = list.length;
    $("#saved-badge").hidden = list.length === 0;
    $("#saved-actions").hidden = list.length === 0;
    renderConflicts();
    renderCtx();
    $("#saved-list").innerHTML = list.length ? list.map((s) => {
      const sp = s.speakers[0] ?? { name: "—" };
      return `<div class="srow" data-sess="${s.id}">
        <div class="tm">${s.timeStart}<small>${s.timeEnd}</small></div>
        <div class="bd">
          <span class="tg" style="${tg(s.track)}">${esc(s.track)}</span>
          <h4>${esc(s.title)}</h4>
          <div class="who">${esc(sp.name)}</div>
          <div class="rm">Day ${s.day} · ${esc(s.room)}</div>
        </div>
        <div class="sv on" data-save="${s.id}"><svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg></div>
      </div>`;
    }).join("") : `<div class="empty"><svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg><p>Belum ada sesi tersimpan.<br>Tap ikon bookmark di sesi mana pun untuk menyimpannya.</p></div>`;
  }

  // ---------- render: speaker ----------
  function renderSpeakers() {
    const q = S.q.toLowerCase();
    const list = D.speakers.filter((sp) => !q || sp.name.toLowerCase().includes(q) || (sp.role || "").toLowerCase().includes(q));
    $("#speaker-list").innerHTML = list.length ? `<div class="sgrid">${list.slice(0, 60).map((sp) => {
      const t = TRACKS[sp.track] ?? TRACKS.Bisnis;
      return `<button class="spcard" data-spk="${esc(sp.name)}">
        <div class="av">${esc(initials(sp.name))}</div>
        <h4>${esc(sp.name)}</h4>
        <p>${esc((sp.role || "").split(" at ")[0])}</p>
        <span class="tg" style="background:${t[1]};color:${t[2]}">${esc(sp.track)}</span>
      </button>`;
    }).join("")}</div>` : `<div class="empty"><svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/></svg><p>Pembicara tidak ditemukan.</p></div>`;
  }

  // ---------- render: profil ----------
  function renderProfile() {
    const savedCount = S.saved.size;
    $("#prof-card").innerHTML = `<div class="row">
        <div class="av">${esc(initials(S.user.name))}</div>
        <div><h3>${esc(S.user.name)}</h3><div class="em">${esc(S.user.email || "raka@email.com")}</div></div>
      </div>
      <div class="rl">${esc(S.user.role)}${S.user.ticket ? " · Attendee" : ""}</div>
      <div class="st">
        <div><b>${savedCount}</b><span>tersimpan</span></div>
        <div><b>${S.user.interests.length}</b><span>minat</span></div>
        <div><b>${D.days.length}</b><span>hari acara</span></div>
      </div>`;
    $("#prof-interests").innerHTML = S.user.interests.map((i) => `<span class="chip-pick on">${esc(i)}</span>`).join("");
    $("#ticket-val").textContent = S.user.ticket || "—";
  }

  // ---------- detail sesi ----------
  function openSession(id) {
    const s = sessionById(id);
    if (!s) return;
    const on = S.saved.has(s.id);
    $("#sess-detail").innerHTML = `<div class="sd">
      <span class="tg" style="${tg(s.track)}">${esc(s.track)}</span>
      <h2>${esc(s.title)}</h2>
      <div class="meta"><span>Day ${s.day} · ${fmtDate(dayOf(s.day).date)}</span><span>${s.timeStart}–${s.timeEnd}</span><span>${esc(s.room)}</span></div>
      <p class="desc">${esc(reasonFor(s))}</p>
      <h4>Pembicara</h4>
      ${s.speakers.map((sp) => `<button class="spkrow" data-spk="${esc(sp.name)}"><div class="av">${esc(initials(sp.name))}</div><div style="flex:1;min-width:0"><b>${esc(sp.name)}</b><small>${esc(sp.role)}</small></div><svg viewBox="0 0 24 24" style="width:16px;height:16px;color:var(--muted);flex:0 0 auto"><path d="M9 18l6-6-6-6"/></svg></button>`).join("")}
      <h4>Detail</h4>
      <div class="spk-stats">
        <div><b>${s.timeStart}</b><span>mulai</span></div>
        <div><b>${s.timeEnd}</b><span>selesai</span></div>
        <div><b>${esc(s.roomShort)}</b><span>ruangan</span></div>
        <div><b>${s.speakers.length}</b><span>pembicara</span></div>
      </div>
      <div class="sd-actions">
        <button class="btn-save${on ? " done" : ""}" data-save="${s.id}">${on ? "Tersimpan ✓" : "Simpan ke jadwal"}</button>
      </div>
    </div>`;
    show("session");
    $("#v-session").scrollTop = 0;
  }

  // ---------- detail speaker ----------
  function openSpeaker(name) {
    const sp = D.speakers.find((x) => x.name === name);
    if (!sp) return;
    const list = allSessions().filter((s) => s.speakers.some((x) => x.name === name));
    const t = TRACKS[sp.track] ?? TRACKS.Bisnis;
    const other = D.speakers.filter((x) => x.track === sp.track && x.name !== sp.name).slice(0, 4);
    const followed = S.follow.has(sp.name);
    $("#spk-detail").innerHTML = `<div class="sd">
      <div class="spk-hero">
        <div class="spk-av">${esc(initials(sp.name))}</div>
        <div class="spk-id">
          <h2>${esc(sp.name)}</h2>
          <div class="spk-role">${esc(sp.role)}</div>
          <div class="spk-tags">
            <span class="tg" style="background:${t[1]};color:${t[2]}">${esc(sp.track)}</span>
            <span class="tg plain">${esc(sp.city)}</span>
            <span class="tg plain">${sp.years} tahun di bidangnya</span>
          </div>
        </div>
      </div>

      <div class="spk-quote">“${esc(sp.quote)}”</div>

      <h4>Tentang</h4>
      <p class="desc">${esc(sp.bio)} ${esc(sp.note || "")}</p>

      <div class="spk-stats">
        <div><b>${list.length}</b><span>sesi di acara</span></div>
        <div><b>${esc(sp.expertise)}</b><span>bidang fokus</span></div>
        <div><b>${esc(sp.company)}</b><span>perusahaan</span></div>
      </div>

      <h4>Sesi di IDEATALKS (${list.length})</h4>
      ${list.map((s) => `<button class="srow" data-sess="${s.id}" style="width:100%;text-align:left">
          <div class="tm">${s.timeStart}<small>${s.timeEnd}</small></div>
          <div class="bd"><span class="tg" style="${tg(s.track)}">${esc(s.track)}</span><h4>${esc(s.title)}</h4><div class="rm">Day ${s.day} · ${esc(s.room)}</div></div>
          <div class="sv${S.saved.has(s.id) ? " on" : ""}" data-save="${s.id}" role="button" aria-label="Simpan sesi">
            <svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
          </div>
        </button>`).join("")}

      <div class="spk-actions">
        <button class="btn-save${followed ? " done" : ""}" id="btn-follow">${followed ? "Diikuti ✓" : "Ikuti pembicara"}</button>
        <button class="btn-save ghost" id="btn-spk-chat">Tanya Mira soal dia</button>
      </div>

      ${other.length ? `<h4>Pembicara lain di ${esc(sp.track)}</h4>
      <div class="spk-related">${other.map((o) => `<button class="spk-mini" data-spk="${esc(o.name)}">
        <div class="av">${esc(initials(o.name))}</div><span>${esc(o.name)}</span></button>`).join("")}</div>` : ""}
    </div>`;
    show("speaker");
    $("#v-speaker").scrollTop = 0;
  }

  // ---------- chat ----------
  function aiReply(q) {
    const ql = q.toLowerCase();
    const recs = recommend(3);
    if (/ringkas|summary|rangkum|3 hari|dua hari/.test(ql)) {
      return { text: `<p>${esc(D.days.length)} hari, ${allSessions().length} sesi, ${D.speakers.length} pembicara.</p><p class="sm">Day 1 paling padat (${D.days[0].sessions.length} sesi), Day 3 paling ringan (${D.days[2].sessions.length}). Track paling ramai <b>${mostPopularTrack()}</b>.</p>` };
    }
    if (/makan|food|kantin|lunch|makan siang|kopi|warung/.test(ql)) {
      return { text: `<p>Kantin buka 11.30–13.00, di sisi timur lobi. Sponsor punya coffee cart di lobi sampai jam 11.45.</p><p class="sm">Kalau lapar tapi kolomnya penuh, <b>FnB track</b> punya sesi jam 15.30 di Crystal 1 — biasanya lebih longgar.</p>` };
    }
    if (/jam berapa|mulai pukul|schedule|jadwal|hari ke|hari nih/.test(ql)) {
      const d = dayOf(S.day);
      return { text: `<p>Hari ${d.day} dimulai ${d.sessions[0].timeStart} dan terakhir ${d.sessions[d.sessions.length - 1].timeEnd}.</p>`, recs: d.sessions.slice(0, 3).map((s) => ({ s, why: "Sesi pembuka hari ini." })) };
    }
    const trackHit = D.tracks.find((x) => ql.includes(x.toLowerCase().split(" ")[0].replace("&", "")));
    if (trackHit) {
      const list = allSessions().filter((s) => s.track === trackHit).slice(0, 3);
      return { text: `<p>Sesi di track <b>${esc(trackHit)}</b>:</p>`, recs: list.map((s) => ({ s, why: reasonFor(s) })) };
    }
    return {
      text: `<p>${esc(S.user.name.split(" ")[0])}, aku pilih ${recs.length} yang paling cocok dengan minatmu.</p>`,
      recs: recs.map(({ s }) => ({ s, why: reasonFor(s) })),
    };
  }
  function mostPopularTrack() {
    const c = {};
    allSessions().forEach((s) => (c[s.track] = (c[s.track] || 0) + 1));
    return Object.entries(c).sort((a, b) => b[1] - a[1])[0][0];
  }

  function chatMsg(role, html, recs) {
    return { role, html, recs };
  }
  function renderChat() {
    $("#chat-thread").innerHTML = S.chat.map((m) => {
      if (m.role === "me") return `<div class="crow me"><div class="bub">${m.html}</div></div>`;
      return `<div class="crow"><div class="bub"><div class="nm">MIRA</div>${m.html}</div></div>` +
        (m.recs && m.recs.length ? `<div class="crec"><div class="lbl">Pilihan Mira</div>${m.recs.map(({ s, why }) => `<div class="ccard">
          <span class="tg" style="${tg(s.track)}">${esc(s.track)}</span>
          <div class="tm">${s.time} · ${esc(s.roomShort)}</div>
          <h4>${esc(s.title)}</h4>
          <div class="who">${esc((s.speakers[0] ?? {}).name || "")}</div>
          <div class="wy">${esc(why)}</div>
        </div>`).join("")}</div>` : "");
    }).join("");
    const t = $("#chat-thread");
    t.scrollTop = t.scrollHeight;
  }

  function sendChat(text) {
    if (!text.trim()) return;
    S.chat.push(chatMsg("me", esc(text)));
    renderChat();
    const typing = document.createElement("div");
    typing.className = "crow";
    typing.innerHTML = `<div class="bub"><div class="typing"><i></i><i></i><i></i></div></div>`;
    $("#chat-thread").appendChild(typing);
    $("#chat-thread").scrollTop = $("#chat-thread").scrollHeight;
    setTimeout(() => {
      typing.remove();
      const r = aiReply(text);
      S.chat.push(chatMsg("ai", r.text, r.recs));
      renderChat();
    }, 700);
  }

  // ---------- navigasi ----------
  function show(v) {
    S.view = v;
    $$(".view").forEach((el) => (el.hidden = el.id !== "v-" + v));
    const inChat = v === "chat";
    $("#btn-mira").style.display = inChat ? "none" : "";
    $("#tabbar").style.display = inChat || v === "session" || v === "speaker" ? "none" : "";
    $("#btn-back").hidden = !(v === "session" || v === "speaker" || v === "chat");
    $$(".tab").forEach((t) => t.classList.toggle("on", t.dataset.v === v));
    $("#scroll").scrollTop = 0;
    if (v === "home") renderHome();
    if (v === "schedule") renderSchedule();
    if (v === "saved") renderSaved();
    if (v === "speakers") renderSpeakers();
    if (v === "profile") renderProfile();
    if (v === "chat") renderChat();
    renderCtx();
  }

  // ---------- onboarding ----------
  function setStep(n) {
    S.onbStep = n;
    $$(".onb-step").forEach((el) => (el.hidden = Number(el.dataset.step) !== n));
    $$("#onb-progress i").forEach((el, i) => el.classList.toggle("on", i < n));
  }

  function finishOnb() {
    const name = $("#f-name").value.trim();
    const email = $("#f-email").value.trim();
    const ticket = $("#f-ticket").value.trim();
    if (!name) { $("#err-3").hidden = false; $("#err-3").textContent = "Isi nama dulu ya."; return; }
    S.user.name = name;
    S.user.email = email;
    S.user.role = S.onbRole || "Pengunjung";
    S.user.interests = [...S.onbInterests];
    S.user.ticket = ticket;
    $("#btn-profile").textContent = initials(name);
    $("#scr-onb").hidden = true;
    $("#scr-main").hidden = false;
    $("#home-name").textContent = name.split(" ")[0];
    localStorage.setItem("ideafest-user", JSON.stringify(S.user));
    show("home");
  }

  // ---------- admin ----------
  // Data pengunjung: 用户 yang benar-benar daftar di app ini (disimpan) + catatan organiser.
  const VISITORS = [
    { name: "Raka Pratama", email: "raka@email.com", role: "Founder", interests: ["Bisnis", "Teknologi"], saved: 4, live: true },
    { name: "Nadia Kusuma", email: "nadia@email.com", role: "Marketing", interests: ["Content", "Art & Culture"], saved: 2 },
    { name: "Bayu Setiawan", email: "bayu@email.com", role: "Product", interests: ["Teknologi"], saved: 5 },
    { name: "Citra Ananda", email: "citra@email.com", role: "Student", interests: ["Self Development", "Content"], saved: 1 },
    { name: "Dimas Wicaksono", email: "dimas@email.com", role: "Investor", interests: ["Bisnis", "Policy Making"], saved: 3 },
    { name: "Fitri Handayani", email: "fitri@email.com", role: "Professional", interests: ["Mental Health", "FnB"], saved: 2 },
  ];
  const QUESTIONS = [
    ["Sesi mana buat yang mau mulai brand?", 412],
    ["Di mana kantin?", 288],
    ["Ringkasan 3 hari", 197],
    ["Speaker dari Surabaya yang di bidang teknologi", 143],
    ["Sesi mental health yang ringan", 96],
    ["Ada 주차 gratis?", 74],
  ];

  function renderAdmin() {
    // KPI
    const visitors = [...VISITORS];
    if (S.user.email) visitors[0] = { ...visitors[0], name: S.user.name, email: S.user.email, role: S.user.role, interests: S.user.interests, saved: S.saved.size, live: true };
    $("#kpi-row").innerHTML = [
      [visitors.length * 3847, "Pengunjung terdaftar"],
      [visitors.length * 218, "Sesi disimpan"],
      [visitors.length * 96, "Pertanyaan ke Mira"],
      [D.days.length, "Hari acara"],
    ].map(([v, l]) => `<div class="kpi"><b>${v.toLocaleString("en-US")}</b><span>${l}</span></div>`).join("");

    // minat
    const c = {};
    visitors.forEach((v) => v.interests.forEach((i) => (c[i] = (c[i] || 0) + 1)));
    const max = Math.max(...Object.values(c));
    $("#kpi-tracks").innerHTML = Object.entries(c).sort((a, b) => b[1] - a[1]).map(([k, v]) => {
      const t = TRACKS[k] ?? TRACKS.Bisnis;
      return `<div class="bar-row"><span class="nm">${esc(k)}</span><span class="bar"><i style="width:${(v / max) * 100}%;background:${t[0]}"></i></span><span class="vv">${v}</span></div>`;
    }).join("");

    // pertanyaan
    const qHtml = QUESTIONS.map(([q, n]) => `<div class="qrow"><div class="q">${esc(q)}</div><div class="n">${n}× ditanya</div></div>`).join("");
    $("#kpi-questions").innerHTML = qHtml;
    $("#kpi-questions2").innerHTML = qHtml;

    // sesi paling disukai
    const pick = {};
    allSessions().forEach((s) => (pick[s.id] = Math.floor(Math.random() * 40)));
    const top = Object.entries(pick).sort((a, b) => b[1] - a[1]).slice(0, 5);
    $("#kpi-sessions").innerHTML = top.map(([id, n]) => {
      const s = sessionById(id);
      if (!s) return "";
      return `<div class="qrow"><div class="q">${esc(s.title)}</div><div class="n">${s.time} · ${esc(s.room)} · ${n}× disimpan</div></div>`;
    }).join("");

    // pengunjung
    const q = (S.adminQuery || "").toLowerCase();
    $("#kpi-visitors").innerHTML = visitors.filter((v) => !q || v.name.toLowerCase().includes(q) || v.email.toLowerCase().includes(q) || v.interests.join(" ").toLowerCase().includes(q)).map((v) => `<div class="vrow"><div class="av">${esc(initials(v.name))}</div><div style="flex:1;min-width:0"><b>${esc(v.name)}${v.live ? ' <span class="live-tag">kamu</span>' : ""}</b><small>${esc(v.email)} · ${esc(v.role)} · ${v.saved} tersimpan</small></div><div class="vints">${v.interests.map((i) => `<span class="tg" style="${tg(i)}">${esc(i)}</span>`).join("")}</div></div>`).join("");

    // materi
    $("#materi-list").innerHTML = D.days.map((d) => `<div class="list-row"><span>${esc(d.dayLabel)} · ${fmtDate(d.date)}</span><b>${d.sessions.length} sesi</b></div>`).join("") +
      `<div class="list-row"><span>Total pembicara</span><b>${D.speakers.length}</b></div>` +
      `<div class="list-row"><span>Total sesi</span><b>${allSessions().length}</b></div>`;
  }

  function showAdmin() {
    $("#scr-main").hidden = true;
    $("#scr-admin").hidden = false;
    renderAdmin();
    $("#admin-scroll").scrollTop = 0;
  }

  function switchAdminPane(name) {
    $$("[data-atab]").forEach((t) => t.classList.toggle("on", t.dataset.atab === name));
    $$(".adm-pane").forEach((p) => (p.hidden = p.dataset.pane !== name));
    $("#admin-scroll").scrollTop = 0;
  }

  // ---------- cari overlay ----------
  function renderSearch(q) {
    ql = (q || "").toLowerCase();
    const out = [];
    allSessions().forEach((s) => {
      if (ql && !s.title.toLowerCase().includes(ql) && !s.speakers.some((x) => x.name.toLowerCase().includes(ql))) return;
      out.push(`<button class="ov-item" data-sess="${s.id}"><div><span class="tg" style="${tg(s.track)}">${esc(s.track)}</span><b>${esc(s.title)}</b><small>${s.time} · ${esc(s.room)} · ${esc(s.speakers.map((x) => x.name).join(", "))}</small></div></button>`);
    });
    D.speakers.forEach((sp) => {
      if (ql && !sp.name.toLowerCase().includes(ql)) return;
      out.push(`<button class="ov-item" data-spk="${esc(sp.name)}"><div><span class="tg" style="${tg(sp.track || "Bisnis")}">Speaker</span><b>${esc(sp.name)}</b><small>${esc(sp.role)}</small></div></button>`);
    });
    $("#ov-results").innerHTML = out.length ? out.slice(0, 40).join("") : `<div class="ov-empty">Tidak ada yang cocok.</div>`;
  }

  // ---------- events ----------
  document.addEventListener("click", (e) => {
    const save = e.target.closest("[data-save]");
    if (save) {
      e.stopPropagation();
      const id = save.dataset.save;
      if (S.saved.has(id)) S.saved.delete(id); else S.saved.add(id);
      if (S.view === "home") renderHome();
      if (S.view === "schedule") renderSchedule();
      if (S.view === "saved") renderSaved();
      if (S.view === "session") openSession(id);
      renderConflicts();
      return;
    }
    const sess = e.target.closest("[data-sess]");
    if (sess) { openSession(sess.dataset.sess); return; }
    const spk = e.target.closest("[data-spk]");
    if (spk) { openSpeaker(spk.dataset.spk); return; }
    const day = e.target.closest("[data-day]");
    if (day) { S.day = Number(day.dataset.day); renderHome(); renderCtx(); return; }
    const tr = e.target.closest("[data-track]");
    if (tr) { S.trackFilter = tr.dataset.track; renderSchedule(); return; }
    const tab = e.target.closest(".tab");
    if (tab) { show(tab.dataset.v); return; }
    const next = e.target.closest("[data-next]");
    if (next) {
      const n = Number(next.dataset.next);
      if (n === 2) {
        const name = $("#f-name").value.trim(), email = $("#f-email").value.trim();
        if (!name || !email) { $("#err-1").hidden = false; return; }
        $("#err-1").hidden = true;
        S.user.name = name; S.user.email = email;
      }
      if (n === 3) {
        if (!S.onbInterests.size) { $("#err-2").hidden = false; return; }
        $("#err-2").hidden = true;
      }
      setStep(n); return;
    }
    const chip = e.target.closest(".chip-pick");
    if (chip && chip.dataset.i !== undefined) {
      chip.classList.toggle("on");
      const i = chip.dataset.i;
      if (chip.classList.contains("on")) S.onbInterests.add(i); else S.onbInterests.delete(i);
    }
    if (chip && chip.dataset.r !== undefined) {
      $$(".chip-pick[data-r]").forEach((c) => c.classList.remove("on"));
      chip.classList.add("on");
      S.onbRole = chip.dataset.r;
    }
    if (e.target.closest("#finish-onb")) { finishOnb(); return; }
    if (e.target.closest("#btn-mira")) { show("chat"); return; }
    if (e.target.closest("#btn-follow")) {
      const nm = $("#spk-detail h2")?.textContent ?? "";
      if (S.follow.has(nm)) { S.follow.delete(nm); notify("Berhenti mengikuti " + nm + "."); }
      else { S.follow.add(nm); notify("Kamu mengikuti " + nm + ". Sesi barunya akan masuk ke beranda."); }
      openSpeaker(nm);
      return;
    }
    if (e.target.closest("#btn-spk-chat")) {
      const nm = $("#spk-detail h2")?.textContent ?? "";
      show("chat");
      setTimeout(() => { const i = $("#chat-text"); if (i) { i.value = "Ceritakan tentang " + nm; i.focus(); } }, 200);
      return;
    }
    if (e.target.closest("#btn-ics")) { exportIcs(); notify("File kalender diunduh."); return; }
    if (e.target.closest("#btn-share")) { shareSchedule(); return; }
    if (e.target.closest("#chat-close")) { show("home"); return; }
    if (e.target.closest("#btn-back")) {
      if (S.view === "session") show("schedule");
      else if (S.view === "speaker") show("speakers");
      else show("home");
      return;
    }
    if (e.target.closest("#sess-close")) { show("schedule"); return; }
    if (e.target.closest("#spk-close")) { show("speakers"); return; }
    if (e.target.closest("#btn-search")) { $("#v-search").hidden = false; $("#ov-q").value = ""; renderSearch(""); $("#ov-q").focus(); return; }
    if (e.target.closest("#ov-close")) { $("#v-search").hidden = true; return; }
    if (e.target.closest("#btn-notif")) { $("#v-notif").hidden = false; renderNotif(); return; }
    if (e.target.closest("#notif-close")) { $("#v-notif").hidden = true; $("#notif-dot").style.display = "none"; return; }
    if (e.target.closest("#btn-profile")) { show("profile"); return; }
    if (e.target.closest("#btn-signout")) { location.reload(); return; }
    if (e.target.closest("#admin-back")) { $("#scr-admin").hidden = true; $("#scr-main").hidden = false; show("home"); return; }
    if (e.target.closest("#btn-admin")) { showAdmin(); return; }
    if (e.target.closest("#btn-visitors")) { showAdmin(); switchAdminPane("orang"); return; }
    const atab = e.target.closest("[data-atab]");
    if (atab) { switchAdminPane(atab.dataset.atab); return; }
    if (e.target.closest("#link-all")) { e.preventDefault(); show("schedule"); return; }
    if (e.target.closest("#edit-interest")) { e.preventDefault(); $("#scr-main").hidden = true; $("#scr-onb").hidden = false; setStep(2); return; }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (!$("#v-search").hidden) { $("#v-search").hidden = true; return; }
      if (!$("#v-notif").hidden) { $("#v-notif").hidden = true; return; }
      if (S.view === "session") { show("schedule"); return; }
      if (S.view === "speaker") { show("speakers"); return; }
      if (S.view === "chat") { show("home"); return; }
    }
    if (e.key === "Enter" && S.view === "chat" && e.target.id === "chat-text") {
      const v = e.target.value; e.target.value = ""; sendChat(v);
    }
  });

  $("#chat-send").addEventListener("click", () => { const v = $("#chat-text").value; $("#chat-text").value = ""; sendChat(v); });
  $("#q-sessions").addEventListener("input", (e) => { S.q = e.target.value; renderSchedule(); });
  $("#q-speakers").addEventListener("input", (e) => { S.q = e.target.value; renderSpeakers(); });
  $("#ov-q").addEventListener("input", (e) => renderSearch(e.target.value));
  $("#q-visitors").addEventListener("input", (e) => { S.adminQuery = e.target.value; renderAdmin(); });

  function renderNotif() {
    const items = [
      ["Sesi \"Strategi Harga\" dimulai 30 menit lagi", "Room Diamond 2", true],
      ["Mira menambah rekomendasi 2 sesi baru", "Sesuai minatmu", true],
      ["Jadwalmu tersimpan 4 sesi", "Lihat di Tersimpan", false],
    ];
    $("#notif-list").innerHTML = items.map(([t, s, un]) => `<div class="ov-item" style="${un ? "background:#FDF2F8" : ""}"><div><b>${esc(t)}</b><small>${esc(s)}</small></div></div>`).join("");
  }

  // ---------- init ----------
  // Isi angka dari data, supaya mockup tidak jatuh saat data berubah.
  $$("[data-count]").forEach((el) => {
    const k = el.dataset.count;
    const v = k === "sessions" ? allSessions().length : k === "speakers" ? D.speakers.length : k === "tracks" ? D.tracks.length : D.days.length;
    el.textContent = v;
  });

  const saved = localStorage.getItem("ideafest-user");
  if (saved) {
    try { Object.assign(S.user, JSON.parse(saved)); } catch {}
    $("#scr-onb").hidden = true;
    $("#scr-main").hidden = false;
    $("#btn-profile").textContent = initials(S.user.name);
  } else {
    setStep(1);
  }
  show("home");

  // admin: klik avatar ganda membuka dashboard
  let adminClicks = 0;
  $("#btn-profile").addEventListener("click", () => {
    adminClicks++;
    if (adminClicks >= 4) {
      adminClicks = 0;
      $("#scr-main").hidden = true; $("#scr-admin").hidden = false; renderAdmin();
    }
  });
})();
