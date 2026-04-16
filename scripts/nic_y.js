const buttonTypes = [
  "play_button",
  "settings_button",
  "skin_button",
  "inbox_button",
  "friends_button",
  "marketplace_button",
  "profile_button",
  "event_button",
];

// 🔥 PRESETS
const buttonPresets = {
  play_button: {
    pressed: "$play_button_target",
    text: "%menu.play",
    hover: "§l%menu.play",
  },
  settings_button: {
    pressed: "button.menu_settings",
    text: "%menu.settings",
    hover: "§l%menu.settings",
  },
  skin_button: {
    pressed: "button.menu_skins",
    text: "%menu.skins",
    hover: "§l%menu.skins",
  },
  inbox_button: {
    pressed: "button.menu_inbox",
    text: "('§z%menu.inbox' + #unread_status)",
    hover: "('§l%menu.inbox' + #unread_status)",
  },
  friends_button: {
    pressed: "button.friends_drawer",
    text: "('§z' + #friends_with_count)",
    hover: "('§l' + #friends_with_count)",
  },
  marketplace_button: {
    pressed: "button.menu_store",
    text: "%menu.store",
    hover: "§l%menu.store",
  },
  profile_button: {
    pressed: "button.menu_profile",
    text: "('%menu.profile (' + #playername + ')')",
    hover: "('§l%menu.profile (' + #playername + ')')",
  },
  event_button: {
    pressed: "button.gathering",
    text: "%gathering.button.join.liveEventFallback",
    hover: "§l%gathering.button.join.liveEventFallback",
  },
};

// 🔹 parse x,y
function parsePair(input) {
  return input.split(",").map((v) => {
    v = v.trim();

    // keep % values as string
    if (v.includes("%")) return v;

    // convert numeric values
    const num = Number(v);
    return isNaN(num) ? v : num;
  });
}

// 🔹 toggle UI
function togglePanelUI() {
  const type = document.getElementById("panel_type").value;
  const img = document.getElementById("image_style");

  if (img) {
    img.style.display = type === "image" ? "block" : "none";
  }
}

// 🔹 apply preset to inputs
function applyPreset(typeEl, defEl, hovEl) {
  const p = buttonPresets[typeEl.value];
  defEl.value = p.text;
  hovEl.value = p.hover;
}

// 🔹 generate buttons UI
function generateButtons() {
  const container = document.getElementById("buttons_container");
  container.innerHTML = "";

  const count = Number(document.getElementById("btn_count").value);

  for (let i = 0; i < count; i++) {
    const wrap = document.createElement("div");

    const type = document.createElement("select");
    buttonTypes.forEach((t) => {
      const o = document.createElement("option");
      o.value = t;
      o.textContent = t;
      type.appendChild(o);
    });

    const def = document.createElement("input");
    def.placeholder = "Default text";

    const hov = document.createElement("input");
    hov.placeholder = "Hover text";

    wrap.appendChild(type);
    wrap.appendChild(def);
    wrap.appendChild(hov);
    container.appendChild(wrap);

    // 🔥 apply preset initially
    applyPreset(type, def, hov);

    // 🔥 events
    type.addEventListener("change", () => {
      applyPreset(type, def, hov);
      updateJSON();
    });

    def.addEventListener("input", updateJSON);
    hov.addEventListener("input", updateJSON);
  }

  updateJSON();
}

// 🔹 SPECIAL BINDINGS
function buildBindings(type, text, hover) {
  if (type === "inbox_button") {
    return {
      $button_text: "#text",
      $button_text_hover: "#text_hover",
      $button_text_property_bag: {
        "#inbox_unread_true": " §c!",
        "#inbox_unread_false": "",
      },
      $button_text_bindings: [
        {
          binding_type: "global",
          binding_name: "#unread_notification_icon_visibility",
        },
        {
          binding_type: "view",
          source_property_name:
            "('#inbox_unread_' + #unread_notification_icon_visibility)",
          target_property_name: "#unread_status",
        },
        {
          binding_type: "view",
          source_property_name: `${text}`,
          target_property_name: "#text",
        },
        {
          binding_type: "view",
          source_property_name: `${hover}`,
          target_property_name: "#text_hover",
        },
      ],
    };
  }

  if (type === "friends_button") {
    return {
      $button_text: "#text",
      $button_text_hover: "#text_hover",
      $button_text_bindings: [
        {
          binding_type: "global",
          binding_name: "#friends_with_count",
        },
        {
          binding_type: "view",
          source_property_name: `${text}`,
          target_property_name: "#text",
        },
        {
          binding_type: "view",
          source_property_name: `${hover}`,
          target_property_name: "#text_hover",
        },
      ],
    };
  }

  if (type === "profile_button") {
    return {
      $button_text: "#text",
      $button_text_hover: "#text_hover",
      $button_text_bindings: [
        { binding_name: "#playername" },
        {
          binding_type: "view",
          source_property_name: `${text}`,
          target_property_name: "#text",
        },
        {
          binding_type: "view",
          source_property_name: `${hover}`,
          target_property_name: "#text_hover",
        },
      ],
    };
  }

  if (type === "event_button") {
    return {
      $button_text: "%gathering.button.join.liveEventFallback",
      $button_text_hover: "§l%gathering.button.join.liveEventFallback",
      bindings: [
        {
          binding_name: "#gathering_enabled",
          binding_name_override: "#visible",
        },
      ],
    };
  }

  return null;
}

// 🔹 MAIN
function updateJSON() {
  togglePanelUI();

  const panelType = document.getElementById("panel_type").value;
  const panelSize = parsePair(
    document.getElementById("panel_size").value || "100%,20"
  );

  const defFont = document.getElementById("font_default").value;
  const hovFont = document.getElementById("font_hover").value;

  const defColor = parsePair(
    document.getElementById("color_default").value || "1,1,1"
  );
  const hovColor = parsePair(
    document.getElementById("color_hover").value || "1,1,1"
  );

  const scale = Number(document.getElementById("font_scale").value || 1);
  const align = document.getElementById("align").value;

  const size = parsePair(document.getElementById("size").value || "120,128");
  const animFrom = parsePair(
    document.getElementById("anim_from").value || "0,20%"
  );
  const animTo = parsePair(document.getElementById("anim_to").value || "0,0");
  const anchor = document.getElementById("anchor").value;

  const data = {
    namespace: "nic_y",
    content: {
      type: "panel",
      size: size,
      animation_reset_name: "screen_animation_reset",
      anims: ["@nic_start.in_anim", "@nic_start.out_anim"],
      anchor_from: anchor,
      anchor_to: anchor,
      $anim_from: animFrom,
      $anim_to: animTo,
      controls: [{ "stacked_panel@stacked_panel": {} }],
    },

    stacked_panel: {
      type: "stack_panel",
      size: ["100%", "100%"],
      orientation: "vertical",
      controls: [],
    },
  };

  document.querySelectorAll("#buttons_container > div").forEach((div) => {
    const type = div.children[0].value;

    const preset = buttonPresets[type];
    const defInput = div.children[1].value;
    const hovInput = div.children[2].value;

    const def = defInput || preset.text;
    const hov = hovInput || preset.hover;

    data.stacked_panel.controls.push({
      [`${type}@${type}`]: {},
    });

    let obj = {
      $pressed_button_name: preset.pressed,
    };

    const special = buildBindings(type, def, hov);

    if (special) {
      Object.assign(obj, special);
    } else {
      obj["$button_text"] = def;
      obj["$button_text_hover"] = hov;
    }

    data[`${type}@button_panel`] = obj;
  });

  // 🔥 PANEL RENDER
  if (panelType === "label") {
    data["button_panel@common.button"] = {
      size: panelSize,
      controls: [
        {
          "default@button_content": {
            text: "$button_text",
            font_type: defFont,
            color: defColor,
          },
        },
        {
          "hover@button_content": {
            text: "$button_text_hover",
            font_type: hovFont,
            color: hovColor,
          },
        },
        {
          "pressed@button_content": {
            text: "$button_text_hover",
            font_type: hovFont,
            color: hovColor,
          },
        },
      ],
    };

    data["button_content"] = {
      type: "label",
      font_scale_factor: scale,
      text_alignment: align,
      "$button_text_property_bag|default": {},
      property_bag: "$button_text_property_bag",
    };
  } else {
    const defTex =
      document.getElementById("tex_default").value ||
      "textures/animated_ui/button";

    const hovTex = document.getElementById("tex_hover").value || defTex;

    const imgSize = parsePair(
      document.getElementById("img_size").value || "100% - 2px,100% - 2px"
    );

    data["button_panel@common.button"] = {
      size: panelSize,
      controls: [
        {
          "default@button_content": {
            texture: defTex,
            $button_label: "$button_text",
            $button_label_font_type: defFont,
            $button_label_color: defColor,
          },
        },
        {
          "hover@button_content": {
            texture: hovTex,
            $button_label: "$button_text_hover",
            $button_label_font_type: hovFont,
            $button_label_color: hovColor,
          },
        },
        {
          "pressed@button_content": {
            texture: hovTex,
            $button_label: "$button_text_hover",
            $button_label_font_type: hovFont,
            $button_label_color: hovColor,
          },
        },
      ],
    };

    data["button_content"] = {
      type: "image",
      size: imgSize,
      controls: [
        {
          button_label: {
            type: "label",
            text: "$button_label",
            font_type: "$button_label_font_type",
            font_scale_factor: scale,
            text_alignment: align,
            color: "$button_label_color",
            "$button_text_property_bag|default": {},
            property_bag: "$button_text_property_bag",
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
  a.download = "nic_y.json";
  a.click();
}

// 🔹 INIT
document.getElementById("panel_type").addEventListener("change", updateJSON);

document.getElementById("btn_count").addEventListener("input", generateButtons);

document.querySelectorAll("input, select").forEach((el) => {
  el.addEventListener("input", updateJSON);
});

generateButtons();
