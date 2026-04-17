function parsePair(input) {
  return input.split(",").map((v) => {
    v = v.trim();
    if (v.includes("%")) return v;

    const num = Number(v);
    return isNaN(num) ? v : num;
  });
}

function toggleUI() {
  const type = document.getElementById("type").value;

  document.getElementById("image_box").style.display =
    type === "image" ? "block" : "none";

  document.getElementById("gradient_box").style.display =
    type === "gradient" ? "block" : "none";
}

function updateJSON() {
  toggleUI();

  const type = document.getElementById("type").value;

  const size = parsePair(document.getElementById("size").value || "120%,120%");

  const anchor = document.getElementById("anchor").value;

  let content = {};

  if (type === "image") {
    const texture =
      document.getElementById("texture").value ||
      "textures/animated_ui/overlay";

    const color = parsePair(
      document.getElementById("color").value || "0,0,0"
    ).map(Number);

    const alpha = Number(document.getElementById("alpha").value || 0.4);

    const fill = document.getElementById("fill").value === "true";

    content = {
      type: "image",
      size: size,
      texture: texture,
      anchor_from: anchor,
      anchor_to: anchor,
      fill: fill,
      color: color,
      alpha: alpha,
    };
  } else {
    const color1 = parsePair(
      document.getElementById("color1").value || "0,0,0,0.5"
    ).map(Number);

    const color2 = parsePair(
      document.getElementById("color2").value || "0,0,0,0.7"
    ).map(Number);

    content = {
      type: "custom",
      renderer: "gradient_renderer",
      color1: color1,
      color2: color2,
      size: size,
      anchor_from: anchor,
      anchor_to: anchor,
    };
  }

  const data = {
    namespace: "nic_overlay",
    content: content,
  };

  document.getElementById("output").textContent = JSON.stringify(data, null, 4);
}

function downloadJSON() {
  const blob = new Blob([document.getElementById("output").textContent], {
    type: "application/json",
  });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "nic_overlay.json";
  a.click();
}

document.querySelectorAll("input, select").forEach((el) => {
  el.addEventListener("input", updateJSON);
});

document.getElementById("type").addEventListener("change", updateJSON);

updateJSON();
