const typeSelect = document.getElementById("title_type");
const labelOptions = document.getElementById("label_options");
const imageOptions = document.getElementById("image_options");

typeSelect.addEventListener("change", () => {
  labelOptions.style.display = typeSelect.value === "label" ? "block" : "none";
  imageOptions.style.display = typeSelect.value === "image" ? "block" : "none";
  updateJSON();
});

function parsePair(input) {
  return input.split(",").map((v) => {
    v = v.trim();
    return v.includes("%") ? v : Number(v);
  });
}

function updateJSON() {
  const size = parsePair(document.getElementById("size").value || "180,28");
  const animFrom = parsePair(
    document.getElementById("anim_from").value || "0,-20%"
  );
  const animTo = parsePair(document.getElementById("anim_to").value || "0,0");

  let data = {
    namespace: "nic_x",
    content: {
      type: "panel",
      size: size,
      animation_reset_name: "screen_animation_reset",
      anims: ["@common.in_anim", "@common.out_anim"],
      anchor_from: document.getElementById("anchor_from").value,
      anchor_to: document.getElementById("anchor_to").value,
      $anim_from: animFrom,
      $anim_to: animTo,
      controls: [{ "title_button@title_button": {} }],
    },
  };

  const type = typeSelect.value;

  // LABEL
  if (type === "label") {
    const defText = document.getElementById("text_default").value;
    const hovText = document.getElementById("text_hover").value;

    const defColor = parsePair(
      document.getElementById("color_default").value || "1,1,1"
    );
    const hovColor = parsePair(
      document.getElementById("color_hover").value || "1,1,1"
    );

    const defFont = document.getElementById("font_default").value;
    const hovFont = document.getElementById("font_hover").value;

    data["title_button@common.button"] = {
      $pressed_button_name: "button.menu_exit",
      controls: [
        {
          "default@title_label": {
            text: defText,
            color: defColor,
            font_type: defFont,
          },
        },
        {
          "hover@title_label": {
            text: hovText,
            color: hovColor,
            font_type: hovFont,
          },
        },
        {
          "pressed@title_label": {
            text: hovText,
            color: hovColor,
            font_type: hovFont,
          },
        },
      ],
    };

    data["title_label"] = {
      type: "label",
      font_scale_factor: Number(
        document.getElementById("font_scale").value || 4
      ),
      text_alignment: document.getElementById("text_align").value,
    };
  }

  // IMAGE
  else {
    const defTex = document.getElementById("tex_default").value;
    const hovTex = document.getElementById("tex_hover").value;

    data["title_button@common.button"] = {
      $pressed_button_name: "button.menu_exit",
      controls: [
        { "default@title_texture": { texture: defTex } },
        { "hover@title_texture": { texture: hovTex } },
        { "pressed@title_texture": { texture: hovTex } },
      ],
    };

    data["title_texture"] = {
      type: "image",
      controls: [
        {
          "screen_title@common_art.title_panel_content": {
            ignored: document.getElementById("ignored").value === "true",
            anchor_from: "center",
            anchor_to: "center",
            size: [0, 0],
            offset: parsePair(
              document.getElementById("offset").value || "20%,0"
            ),
          },
        },
      ],
    };
  }

  document.getElementById("output").textContent = JSON.stringify(data, null, 4);
}

function downloadJSON() {
  const blob = new Blob([document.getElementById("output").textContent], {
    type: "application/json",
  });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "nic_x.json";
  a.click();
}

document.querySelectorAll("input, select").forEach((el) => {
  el.addEventListener("input", updateJSON);
});

updateJSON();
