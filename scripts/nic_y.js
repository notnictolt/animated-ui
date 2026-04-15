function parsePair(input) {
  return input.split(",").map((v) => {
    v = v.trim();
    return v.includes("%") ? v : v;
  });
}

// 🔥 UI TOGGLE LOGIC
function updateVisibility() {
  const bindVersion = document.getElementById("bind_version").value === "true";
  const bindPlayer = document.getElementById("bind_player").value === "true";

  const textBox = document.getElementById("text_box");
  const exprBox = document.getElementById("expr_box");

  // Show text ONLY if both false
  if (!bindVersion && !bindPlayer) {
    textBox.style.display = "block";
    exprBox.style.display = "none";
  } else {
    textBox.style.display = "none";
    exprBox.style.display = "block";
  }
}

function updateJSON() {
  updateVisibility();

  const size = parsePair(
    document.getElementById("size").value || "100%c,100%c"
  );
  const animFrom = parsePair(
    document.getElementById("anim_from").value || "0,20%"
  );
  const animTo = parsePair(document.getElementById("anim_to").value || "0,0");

  const anchor = document.getElementById("anchor").value;

  const font = document.getElementById("font").value;
  const color = parsePair(
    document.getElementById("color").value || "1,1,1"
  ).map(Number);
  const alpha = Number(document.getElementById("alpha").value || 0.5);
  const align = document.getElementById("align").value;

  const bindings = [];

  const bindVersion = document.getElementById("bind_version").value === "true";
  const bindPlayer = document.getElementById("bind_player").value === "true";

  if (bindVersion) {
    bindings.push({ binding_name: "#version" });
  }

  if (bindPlayer) {
    bindings.push({ binding_name: "#playername" });
  }

  const expr = document.getElementById("expr").value;

  if (bindVersion || bindPlayer) {
    bindings.push({
      binding_type: "view",
      source_property_name: expr || "('Minecraft ' + #version)",
      target_property_name: "#text",
    });
  }

  const label = {
    type: "label",
    font_type: font,
    color: color,
    alpha: alpha,
    text_alignment: align,
  };

  // Only include text if both bindings are false
  if (!bindVersion && !bindPlayer) {
    label.text = document.getElementById("text").value || "#text";
  }

  if (bindings.length > 0) {
    label.bindings = bindings;
  }

  const data = {
    namespace: "nic_y",
    content: {
      type: "panel",
      size: size,
      anchor_from: anchor,
      anchor_to: anchor,
      animation_reset_name: "screen_animation_reset",
      anims: ["@common.in_anim", "@common.out_anim"],
      $anim_from: animFrom,
      $anim_to: animTo,
      controls: [
        {
          label: label,
        },
      ],
    },
  };

  document.getElementById("output").textContent = JSON.stringify(data, null, 4);
}

function downloadJSON() {
  const blob = new Blob([document.getElementById("output").textContent], {
    type: "application/json",
  });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "nic_y.json";
  a.click();
}

// LISTENERS
document.querySelectorAll("input, select").forEach((el) => {
  el.addEventListener("input", updateJSON);
});

// INIT
updateJSON();
